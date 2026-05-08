import { resend } from '@/lib/resend';
import { WhatsAppManager } from '../whatsapp/WhatsAppClient';
import webpush from 'web-push';
import { createAdminClient } from '../supabase/admin';
import { normalizePhone } from '@/utils/phone';

// VAPID keys should be in .env.local
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      'mailto:notifications@unheard.co.in',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.error('Failed to initialize VAPID details for web-push:', err);
  }
} else {
  console.warn('VAPID keys missing. Web push notifications will be disabled.');
}

export class NotificationController {
  /**
   * Sends an email notification using Resend
   */
  static async sendEmail({ to, subject, html, from }: { to: string | string[], subject: string, html: string, from?: string }) {
    try {
      const { data, error } = await resend.emails.send({
        from: from || 'unHeard <notifications@unheard.care>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Resend Email Exception:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Sends a WhatsApp notification
   */
  static async sendWhatsApp(phone: string, message: string) {
    try {
      const result = await WhatsAppManager.enqueueMessage(phone, message);
      return result;
    } catch (err) {
      console.error('WhatsApp Exception:', err);
      return { success: false, error: err };
    }
  }
  /**
   * Sends a Web Push notification to all subscriptions associated with a phone number
   */
  static async sendPush(phone: string, title: string, body: string, url = '/') {
    try {
      const supabase = await createAdminClient();
      
      // Clean phone for lookup
      let formattedPhone = normalizePhone(phone);

      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('phone', formattedPhone);

      if (!subscriptions || subscriptions.length === 0) return { success: false, error: 'No push subscriptions found' };

      const payload = JSON.stringify({ title, body, url });

      const results = await Promise.all(subscriptions.map(async (sub) => {
        try {
          // Reconstruct subscription object for web-push
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: sub.keys
          };
          await webpush.sendNotification(pushSubscription, payload);
          return { success: true };
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription has expired or is no longer valid, delete it
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
          return { success: false, error: err.message };
        }
      }));

      return { success: true, results };
    } catch (err) {
      console.error('Web Push Exception:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Triggers a notification for a new appointment
   */
  static async notifyNewAppointment(appointment: any, therapistEmail: string) {
    return this.sendEmail({
      to: therapistEmail,
      subject: 'New Appointment Scheduled - unHeard',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0F9393;">New Appointment Request</h2>
          <p>Hello,</p>
          <p>A new appointment has been scheduled through the unHeard platform.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Client:</strong> ${appointment.client_name || 'New Client'}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Time:</strong> ${new Date(appointment.date + ' ' + (appointment.time || '')).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })} IST</p>
          </div>
          <p>Please log in to your dashboard to confirm or manage this session.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">unHeard. Clarity For Your Inner World.</p>
        </div>
      `,
    });
  }

  /**
   * Triggers a notification for a new therapist registration (for admins)
   */
  static async notifyNewTherapistRegistration(therapist: any) {
    return this.sendEmail({
      to: 'admin@unheard.com', // Placeholder for admin email
      subject: 'Action Required: New Therapist Application',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0F9393;">New Therapist Registration</h2>
          <p>A new therapist has registered on the platform and is awaiting verification.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${therapist.full_name}</p>
            <p><strong>Qualification:</strong> ${therapist.qualification}</p>
            <p><strong>Email:</strong> ${therapist.email}</p>
          </div>
          <p>Please review the application in the Super Admin dashboard.</p>
        </div>
      `,
    });
  }

  /**
   * Triggers an urgent alert to the admin if the WhatsApp headless client disconnects
   */
  static async notifyAdminTokenExpired(reason: string) {
    console.error('Dispatching Token Expiry Alert to Admin:', reason);
    
    // 1. Send Email Notification
    await this.sendEmail({
      to: 'admin@unheard.com',
      subject: '⚠️ URGENT: WhatsApp Bot Token Expired',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #D32F2F;">WhatsApp Web Token Expired / Disconnected</h2>
          <p>The automated WhatsApp messaging service has lost its connection.</p>
          <div style="background: #f4f4f4; padding: 15px; border-left: 4px solid #D32F2F; margin: 20px 0;">
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>Please log into your dashboard and scan the new QR code to restore automation.</p>
        </div>
      `,
    });
  }

  /**
   * Notification for therapist invite
   */
  static async notifyTherapistInvite({ email, phone, name, inviteLink }: { email: string, phone: string, name: string, inviteLink: string }) {
    const waMessage = `Hi ${name || 'there'},\n\nYou have been invited to join unHeard as a specialized therapist.\n\n🔗 *Login Link:* ${inviteLink}\n\nInstall the app when prompted and then head to profile and complete the profile. Happy Day!\n\n💡 *Note:* If links are not clickable, please reply with a "Hi" to this message.`;
    
    await Promise.all([
      this.sendEmail({
        to: email,
        subject: 'Invite: Join the Unheard Therapist Team',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0F9393;">Welcome to unHeard.</h2>
            <p>Hi ${name || 'there'},</p>
            <p>You have been invited to join unHeard as a specialized therapist (Admin).</p>
            <p>Please click the link below to login using your phone number and OTP:</p>
             <p>Install the app when prompted and then head to profile and complete the profile Happy Day!</p>
            <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Unheard</a>

          </div>
        `,
      }),
      this.sendWhatsApp(phone, waMessage),
      this.sendPush(phone, 'Team Invite 🤝', 'You have been invited to join the professional therapist team.', inviteLink)
    ]);
  }

  /**
   * Notification for session summary
   */
  static async notifySessionSummary({ email, phone, name, summary }: { email: string, phone: string, name: string, summary: string }) {
    const portalLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://unheard.co.in'}/login`;
    const chromePortalLink = portalLink.replace('https://', 'googlechromes://');
    const waMessage = `*Session Summary* 📝\n\nHi ${name}, thank you for your session with unHeard today.\n\n*Therapist's Note:* ${summary}\n\n🔗 *View Portal:* ${portalLink}\n\n🚀 *Open in Chrome (iOS):* ${chromePortalLink}\n\nWe hope this brought you some clarity.\n\n💡 *Note:* If links are not clickable, please reply with a "Hi" to this message.`;

    await Promise.all([
      this.sendEmail({
        to: email,
        subject: 'Your Session Summary - unHeard',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0F9393;">Session Summary</h2>
            <p>Hi ${name},</p>
            <p>Thank you for sharing your journey with us today. Here is the summary of your session:</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; border-left: 4px solid #0F9393; margin: 20px 0; font-style: italic;">
              ${summary}
            </div>
            <p>We hope this session helped you find some clarity. You can view your full clinical history in your patient portal.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">unHeard. Clarity For Your Inner World.</p>
          </div>
        `,
      }),
      this.sendWhatsApp(phone, waMessage),
      this.sendPush(phone, 'Session Summary 📝', `Hi ${name}, your session summary is ready to view.`, portalLink)
    ]);
  }
}
