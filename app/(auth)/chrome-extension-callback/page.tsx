'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ChromeExtensionCallback() {
  const { data: session } = useSession();

  useEffect(() => {
    // When session loads and user is authenticated,
    // show success message and close the window
    if (session && session.user) {
      // Display success message
      document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
          <div style="text-align: center; max-width: 400px; padding: 20px;">
            <div style="font-size: 72px; margin-bottom: 20px;">✓</div>
            <h1 style="margin-bottom: 16px;">Successfully signed in!</h1>
            <p style="color: #666;">You can now close this window and return to the extension.</p>
          </div>
        </div>
      `;

      // This window will be automatically closed by the extension
      // after it detects the successful authentication
    }
  }, [session]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Authenticating...</h1>
        <p className="text-gray-500 mt-2">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
