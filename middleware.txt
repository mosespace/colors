import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the request is for the API
  if (path.startsWith('/api/v1')) {
    const apiKey = request.headers.get('x-api-key');

    if (process.env.NODE_ENV === 'production' && !apiKey) {
      return new NextResponse(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify API key
    try {
      const res = await fetch(`${request.nextUrl.origin}/api/verify-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!res.ok) {
        return new NextResponse(JSON.stringify({ error: 'Invalid API key' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await res.json();

      // Attach user ID to the request headers for downstream handlers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', data.userId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  // Protected routes logic for non-API routes
  const publicPaths = ['/', '/login', '/reset-password', '/forgot-password'];

  const isPathProtected = !publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith('/api/'),
  );

  if (isPathProtected) {
    const token = await getToken({ req: request });

    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
