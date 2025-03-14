'use server';

import FeedbackEmail from '@/components/emails/feedback-email';
import { createErrorResponse } from '@/utils/errorHandler';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

export async function sendFeedback(data: any) {
  try {
    // const activeUserSession = await getServerSession(authOptions);
    // const user = activeUserSession?.user;
    const userName = 'Random User';

    // if (!activeUserSession) {
    //   return {
    //     status: 500,
    //     data: null,
    //     error: 'No active session, please login first',
    //   };
    // }

    // const feedback = await db.feedback.create({
    //   data,
    // });

    const resend = new Resend(process.env.RESEND_API_KEY as any);

    const email = await resend.emails.send({
      from: 'Colors Inc <feedback@mosespace.com>',
      to: process.env.ADMIN_EMAIL!,
      subject: 'New Feedback Received 👋🙏',
      react: FeedbackEmail({ message: data.message, userName }),
    });

    // console.log('Email Sent:', email);
    // revalidatePath('/');
    return { status: 201, data: email };
  } catch (error: any) {
    console.error(error);
    return createErrorResponse(500, 'Internal Server Error', error.message);
  }
}
