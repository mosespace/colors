'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@mosespace/toast';

interface ProvidersProps {
  children: React.ReactNode;
  session?: any; // Optional session prop
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster position="bottom-right" />
    </SessionProvider>
  );
}
