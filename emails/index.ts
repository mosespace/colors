import { resend } from '@/lib/resend';
import { CreateEmailOptions } from 'resend';
import { sendEmailViaResend } from './send-via-resend';

export const sendEmail = async ({
  email,
  subject,
  from,
  bcc,
  replyToFromEmail,
  text,
  react,
  scheduledAt,
  marketing,
}: Omit<CreateEmailOptions, 'to' | 'from'> & {
  email: string;
  from?: string;
  replyToFromEmail?: boolean;
  marketing?: boolean;
}) => {
  if (resend) {
    return await sendEmailViaResend({
      email,
      subject,
      from,
      bcc,
      replyToFromEmail,
      text,
      react,
      scheduledAt,
      marketing,
    });
  }

  // Fallback to SMTP if Resend is not configured
  // const smtpConfigured = Boolean(
  //   process.env.SMTP_HOST && process.env.SMTP_PORT,
  // );

  // if (smtpConfigured) {
  //   return await sendEmailViaSMTP({
  //     email,
  //     subject,
  //     text,
  //     react,
  //   });
  // }

  console.info(
    'Email sending failed: Neither SMTP nor Resend is configured. Please set up at least one email service to send emails.',
  );
};
