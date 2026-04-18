import { mailer } from '@/lib/mailer';

export class NotificationController {
  /**
   * Sends an email notification using Nodemailer
   */
  static async sendEmail({ to, subject, html }: { to: string | string[], subject: string, html: string }) {
    try {
      const info = await mailer.sendMail({
        from: '"unHeard" <notifications@unheard.care>',
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      });
      return { success: true, data: info };
    } catch (err) {
      console.error('Email Exception:', err);
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
      to: 'admin@unheard.com', // Replace with dynamic admin email if needed
      subject: '⚠️ URGENT: WhatsApp Bot Token Expired',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #D32F2F;">WhatsApp Web Token Expired / Disconnected</h2>
          <p>The automated WhatsApp messaging service running via Puppeteer has lost its connection.</p>
          <div style="background: #f4f4f4; padding: 15px; border-left: 4px solid #D32F2F; margin: 20px 0;">
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>Please log into your hosting terminal, restart the application, and scan the new QR code directly from the terminal to restore automation.</p>
        </div>
      `,
    });

    // 2. Push Notification Dispatch
    // To trigger a push notification for the admin (since browsers are closed), 
    // we would lookup the push_subscriptions for the admin user_id and fire a Web Push Event.
    // Example: await processPushNotificationToAdmins({ title: "WhatsApp Disconnected", body: reason });
  }
}
