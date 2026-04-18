import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

export async function POST() {
  try {
    await WhatsAppManager.restartAndReconnect();
    return NextResponse.json({ success: true, message: 'Reinitialization started' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
