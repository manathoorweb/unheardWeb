import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import { NotificationController } from '../notifications/NotificationController';
import { getSupabaseAuthState } from './getSupabaseAuthState';
import { createAdminClient } from '../supabase/admin';

// Global state container to prevent hot-reloads from spawning multiple connections
const globalForWhatsApp = global as unknown as { 
  socket: any | null;
  status: 'disconnected' | 'initializing' | 'pending_qr' | 'authenticated' | 'error';
  qrDataUrl: string | null;
};

// Initialize default state
if (!globalForWhatsApp.status) globalForWhatsApp.status = 'disconnected';
if (!globalForWhatsApp.qrDataUrl) globalForWhatsApp.qrDataUrl = null;

export class WhatsAppManager {
  static getStatus() {
    return {
      status: globalForWhatsApp.status,
      qrDataUrl: globalForWhatsApp.qrDataUrl,
      // We don't need a DB count check here anymore; 
      // Baileys will transition to pending_qr if it finds no creds.
    };
  }

  static async restartAndReconnect() {
    console.log('🔄 Manually resetting WhatsApp session and clearing ALL authentication data...');
    
    // 1. Kill current socket and listeners
    if (globalForWhatsApp.socket) {
      try {
        globalForWhatsApp.socket.ev.removeAllListeners('connection.update');
        globalForWhatsApp.socket.ev.removeAllListeners('creds.update');
        globalForWhatsApp.socket.end(undefined); 
      } catch {}
      globalForWhatsApp.socket = null;
    }

    // 2. Clear state
    globalForWhatsApp.status = 'disconnected';
    globalForWhatsApp.qrDataUrl = null;

    // 3. PURGE ALL AUTH DATA from Supabase
    const supabase = await createAdminClient();
    await supabase.from('whatsapp_auth').delete().not('id', 'is', 'null'); // Delete EVERYTHING

    // 4. Trigger fresh connection
    return await this.connectToWhatsApp();
  }

  static async getClient() {
    if (globalForWhatsApp.socket && globalForWhatsApp.status === 'authenticated') {
      return globalForWhatsApp.socket;
    }
    return await this.connectToWhatsApp();
  }

  static async connectToWhatsApp() {
    // 1. Singleton Guard: Only proceed if disconnected or error.
    if (globalForWhatsApp.status === 'initializing' || 
        globalForWhatsApp.status === 'pending_qr' || 
        (globalForWhatsApp.status === 'authenticated' && globalForWhatsApp.socket)) {
      console.log(`⏳ WhatsApp is in state ${globalForWhatsApp.status}... skipping duplicate connection.`);
      return globalForWhatsApp.socket;
    }

    console.log('Booting Baileys WebSockets Connection over Supabase Cloud DB...');
    globalForWhatsApp.status = 'initializing';
    
    // 2. Cleanup existing socket if any (safety measure)
    if (globalForWhatsApp.socket) {
      try {
        globalForWhatsApp.socket.ev.removeAllListeners('connection.update');
        globalForWhatsApp.socket.end(undefined);
      } catch (e) {}
      globalForWhatsApp.socket = null;
    }

    const { state, saveCreds } = await getSupabaseAuthState();

    try {
      // Fetch latest version to avoid protocol mismatches (Status 405)
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`Using WhatsApp v${version.join('.')} (latest: ${isLatest})`);

      const socket = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ['unHeard', 'Chrome', '1.0.0'], 
        logger: pino({ level: 'silent' }),
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
      });

      socket.ev.on('creds.update', saveCreds);

      socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log('Baileys QR Code Generated (waiting for Super Admin UI to fetch it)...');
          globalForWhatsApp.status = 'pending_qr';
          try {
            const dataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
            globalForWhatsApp.qrDataUrl = dataUrl;
          } catch (err) {
            console.error('Failed to generate QR data URL:', err);
          }
        }

        if (connection === 'close') {
          const lastDisconnectError = lastDisconnect?.error as any;
          const statusCode = lastDisconnectError?.output?.statusCode;
          
          const isFatal = statusCode === DisconnectReason.loggedOut || statusCode === 405;
          const shouldReconnect = !isFatal;
          
          console.error(`⚠️ Baileys WhatsApp Connection Closed. Status: ${statusCode}. Reconnecting: ${shouldReconnect}`);
          
          globalForWhatsApp.socket = null; 
          globalForWhatsApp.qrDataUrl = null;

          if (shouldReconnect) {
            globalForWhatsApp.status = 'disconnected';
            console.log('Brief pause, then reconnecting Baileys securely...');
            setTimeout(() => {
               this.connectToWhatsApp(); 
            }, 5000); 
          } else {
            globalForWhatsApp.status = 'error';
            await NotificationController.notifyAdminTokenExpired(`WhatsApp Session Expired (Status ${statusCode}). Manual scan required from dashboard.`);
          }
        } else if (connection === 'open') {
          console.log('✅ Baileys WebSockets authenticated and connected!');
          globalForWhatsApp.status = 'authenticated';
          globalForWhatsApp.qrDataUrl = null; 
        }
      });

      globalForWhatsApp.socket = socket;
      return socket;
    } catch (err) {
      console.error('Failed to initialize Baileys:', err);
      globalForWhatsApp.status = 'error';
      return null;
    }
  }

  static async sendMessage(phoneNumber: string, message: string) {
    if (globalForWhatsApp.status !== 'authenticated' || !globalForWhatsApp.socket) {
      return { success: false, error: 'Client is not connected' };
    }

    let formattedNumber = phoneNumber.replace(/\D/g, ''); 
    
    // Auto-prepend 91 if it looks like a 10-digit Indian number 
    if (formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber;
    }

    if (!formattedNumber.endsWith('@s.whatsapp.net')) {
      formattedNumber = `${formattedNumber}@s.whatsapp.net`;
    }

    try {
      await globalForWhatsApp.socket.sendMessage(formattedNumber, { text: message });
      console.log(`WhatsApp message sent to ${formattedNumber}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to send WhatsApp message via Baileys:', error);
      return { success: false, error };
    }
  }

  static async waitForAuthenticated(timeoutMs = 30000): Promise<{ status: string }> {
    // 1. Trigger connection if not already in progress or connected
    await this.connectToWhatsApp();

    // 2. Poll for status change (fast polling for short-lived functions)
    const startTime = Date.now();
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const currentStatus = globalForWhatsApp.status;
        const elapsed = Date.now() - startTime;

        if (currentStatus === 'authenticated' || currentStatus === 'pending_qr' || currentStatus === 'error' || elapsed >= timeoutMs) {
          clearInterval(interval);
          resolve({ status: currentStatus });
        }
      }, 500);
    });
  }
}
