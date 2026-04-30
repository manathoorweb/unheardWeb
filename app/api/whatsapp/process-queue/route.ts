import { createAdminClient } from '@/lib/supabase/admin';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sb = await createAdminClient();
    
    // 1. Check if authenticated
    const status = WhatsAppManager.getStatus();
    if (status.status !== 'authenticated') {
      // Try to soft reconnect or wait
      await WhatsAppManager.connectToWhatsApp();
      const waitResult = await WhatsAppManager.waitForAuthenticated(10000);
      if (waitResult.status !== 'authenticated') {
        return NextResponse.json({ success: false, error: 'WhatsApp is not authenticated' }, { status: 503 });
      }
    }

    // 2. Process pending messages
    const { data: pending } = await sb
      .from('whatsapp_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10);

    if (!pending || pending.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    let successCount = 0;
    for (const msg of pending) {
      const result = await WhatsAppManager.sendMessage(msg.phone, msg.message, false);
      if (result.success) {
        await sb.from('whatsapp_queue').update({ status: 'sent', attempts: msg.attempts + 1 }).eq('id', msg.id);
        successCount++;
      } else {
        const newAttempts = (msg.attempts || 0) + 1;
        const newStatus = newAttempts >= 3 ? 'failed' : 'pending';
        await sb.from('whatsapp_queue').update({ 
          status: newStatus, 
          attempts: newAttempts,
          error: result.error?.toString() || 'Unknown error'
        }).eq('id', msg.id);
      }
    }

    // 3. Cleanup old entries (older than 48 hours)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    await sb.from('whatsapp_queue').delete().lt('created_at', fortyEightHoursAgo);

    return NextResponse.json({ success: true, processed: pending.length, sent: successCount });
  } catch (error: any) {
    console.error('Queue Processing Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
