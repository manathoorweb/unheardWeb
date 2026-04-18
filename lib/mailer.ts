import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, from }: { to: string | string[], subject: string, html: string, from?: string }) => {
  try {
    const info = await mailer.sendMail({
      from: from || process.env.SMTP_FROM || '"unHeard" <notifications@unheard.care>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    });
    return { success: true, data: info };
  } catch (error) {
    console.error('Email Error:', error);
    return { success: false, error };
  }
};
