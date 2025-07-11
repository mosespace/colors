import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import { SendFeedback } from '@/components/send-feedback';
import { siteConfig } from '@/constants/site';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Color Bliss - Palette Generator',
  description: `${siteConfig.description} | crafted by @mosespace`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={``}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
        <SendFeedback />
      </body>
    </html>
  );
}
