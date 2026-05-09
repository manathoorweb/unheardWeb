import { createAdminClient } from '@/lib/supabase/admin';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sb = await createAdminClient();
    
    // 1. Check if authenticated
    const status = await WhatsAppManager.getStatus();
    
    if (status.status !== 'authenticated') {
      // If another instance is ALREADY handling the connection, we don't need to do anything here.
      // The background worker in that instance will process the queue.
      if (status.isLockedByOther) {
        console.log(`[Queue] Connection lock held by instance ${status.lockInstanceId}. Delegating queue processing.`);
        return NextResponse.json({ 
          success: true, 
          message: 'Delegated to active worker instance',
          instance: status.lockInstanceId 
        });
      }

      await WhatsAppManager.connectToWhatsApp();
      const waitResult = await WhatsAppManager.waitForAuthenticated(10000);
      if (waitResult.status !== 'authenticated') {
        return NextResponse.json({ success: false, error: 'WhatsApp is not authenticated' }, { status: 503 });
      }
    }

    const now = new Date().toISOString();
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    // 2a. Fetch all due pending messages (includes overdue ones — scheduled_time <= now)
    const { data: pendingMessages } = await sb
      .from('whatsapp_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', now)
      .order('scheduled_time', { ascending: true })
      .limit(20);

    // 2b. Fetch recently-failed messages for retry
    // These may have failed due to WhatsApp being offline when they were due.
    // Only retry messages < 6 hours old and with fewer than 5 attempts.
    const { data: failedMessages } = await sb
      .from('whatsapp_queue')
      .select('*')
      .eq('status', 'failed')
      .gte('created_at', sixHoursAgo)
      .lt('attempts', 5)
      .order('scheduled_time', { ascending: true })
      .limit(10);

    const allMessages = [
      ...(pendingMessages || []),
      ...(failedMessages || [])
    ];

    if (allMessages.length === 0) {
      return NextResponse.json({ success: true, processed: 0, sent: 0, retried: 0 });
    }

    let successCount = 0;
    let retriedCount = 0;

    for (const msg of allMessages) {
      const isRetry = msg.status === 'failed';
      const result = await WhatsAppManager.sendMessage(msg.phone, msg.message, false);

      if (result.success) {
        await sb
          .from('whatsapp_queue')
          .update({ status: 'sent', attempts: (msg.attempts || 0) + 1, error: null })
          .eq('id', msg.id);
        successCount++;
        if (isRetry) retriedCount++;
      } else {
        const newAttempts = (msg.attempts || 0) + 1;
        // Hard fail after 5 attempts; otherwise keep as pending so next cycle retries it
        const newStatus = newAttempts >= 5 ? 'failed' : 'pending';
        await sb
          .from('whatsapp_queue')
          .update({
            status: newStatus,
            attempts: newAttempts,
            error: result.error?.toString() || 'Unknown error'
          })
          .eq('id', msg.id);
      }
    }

    // 3. Cleanup old entries (older than 72 hours)
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    await sb.from('whatsapp_queue').delete().lt('created_at', seventyTwoHoursAgo);

    return NextResponse.json({
      success: true,
      processed: allMessages.length,
      sent: successCount,
      retried: retriedCount
    });
  } catch (error: any) {
    console.error('Queue Processing Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
