import { resend } from '@/lib/resend';
import { WhatsAppManager } from '../whatsapp/WhatsAppClient';

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
            <p><strong>Date:</strong> ${appointment.date}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
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
    const waMessage = `Hi ${name || 'there'},\n\nYou have been invited to join unHeard as a specialized therapist.\n\nPlease login at ${inviteLink} with your phone number and OTP to complete your setup. \n\nInstall the app when prompted and then head to profile and complete the profile Happy Day!\n\n`;
    
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
      this.sendWhatsApp(phone, waMessage)
    ]);
  }

  /**
   * Notification for session summary
   */
  static async notifySessionSummary({ email, phone, name, summary }: { email: string, phone: string, name: string, summary: string }) {
    const waMessage = `*Session Summary* 📝\n\nHi ${name}, thank you for your session with unHeard today.\n\n*Therapist's Note:* ${summary}\n\nWe hope this brought you some clarity. Feel free to book your next session anytime through your portal.`;

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
      this.sendWhatsApp(phone, waMessage)
    ]);
  }
}
