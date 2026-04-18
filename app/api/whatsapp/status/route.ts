import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

export async function GET() {
  try {
    const state = WhatsAppManager.getStatus();
    
    // Auto-initialize if it hasn't been started yet
    if (state.status === 'disconnected') {
      WhatsAppManager.getClient();
    }

    return NextResponse.json({
      success: true,
      data: WhatsAppManager.getStatus()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
