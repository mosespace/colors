import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';
import ForgotPasswordForm from './forgot-password-form';

export default async function page() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/stacks');
  }
  return (
    <div className="px-4">
      <ForgotPasswordForm />
    </div>
  );
}
