import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class NotificationController {
  /**
   * Sends an email notification using Resend
   */
  static async sendEmail({ to, subject, html }: { to: string | string[], subject: string, html: string }) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'unHeard <notifications@unheard.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      });

      if (error) {
        console.error('Email Error:', error);
        return { success: false, error };
      }

      return { success: true, data };
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
}
