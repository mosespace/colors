'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { siteConfig } from '@/constants/site';
import { toast } from '@mosespace/toast';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface AuthState {
  email: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  error: string | null;
}

export default function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // console.log('Status ✅:', status);

  const [state, setState] = React.useState<AuthState>({
    email: '',
    password: '',
    showPassword: false,
    isLoading: false,
    error: null,
  });

  const validateCallbackUrl = (url: string | undefined): string => {
    if (!url) return '/overview';
    try {
      const urlObject = new URL(url, window.location.origin);
      const allowedDomains = [window.location.origin];
      if (!allowedDomains.includes(urlObject.origin)) {
        return '/overview';
      }
      return urlObject.pathname + urlObject.search;
    } catch {
      return '/overview';
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const callbackUrl = validateCallbackUrl(
        window.location.search?.split('callbackUrl=')[1],
      );

      const result = await signIn('google', {
        callbackUrl,
        redirect: false, // Change this to false to handle the error
      });

      if (result?.error === 'OAuthAccountNotLinked') {
        setState((prev) => ({
          ...prev,
          error:
            'An account already exists with your email address. Please sign in with your original authentication method.',
          isLoading: false,
        }));
        return;
      }

      // If no error, redirect manually
      if (!result?.error) {
        router.push(callbackUrl);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to sign in with Google. Please try again.',
        isLoading: false,
      }));
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.email || !state.password) {
      setState((prev) => ({
        ...prev,
        error: 'Please fill in all fields',
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const result = await signIn('credentials', {
        redirect: false,
        email: state.email,
        password: state.password,
      });

      if (result?.error) {
        toast.error('Error', `${result.error}`);
      }

      const callbackUrl = validateCallbackUrl(
        window.location.search?.split('callbackUrl=')[1],
      );

      if (result?.ok && !result?.error) {
        const data = {
          userId: 'userId',
          action: 'login',
          description: 'Logged into the system with email',
          details: {
            status: 'loggedIn',
          },
        };

        router.push(callbackUrl);
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result?.error || 'Authentication failed',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Invalid email or password',
        isLoading: false,
      }));
    }
  };

  const togglePassword = () => {
    setState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  // Handle OAuth error parameters first (always execute this effect)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    if (errorParam === 'OAuthAccountNotLinked') {
      setState((prev) => ({
        ...prev,
        error:
          'An account already exists with your email address. Please sign in with your another method or google account instead.',
      }));
    }
  }, []);

  // This needs to be a separate effect
  React.useEffect(() => {
    if (session && status === 'authenticated') {
      router.push('/overview');
    }
  }, [session, status, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-gradient-to-b from-black/60 to-black/60 bg-cover"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-0"></div>

      <div className="w-full max-w-md relative z-50 space-y-6">
        <div className="text-center space-y-6">
          <span className="font-bold text-primary underline underline-offset-[8px]">
            {siteConfig.name}
          </span>
          <h1 className="text-3xl text-white font-semibold">Welcome back</h1>
        </div>

        <div className="bg-[#1C1C1C] rounded-xl p-8 space-y-6">
          {state.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-red-500 font-medium">
                  {state.error}
                  {state.error ===
                    'An account already exists with your email address. Please sign in with your original authentication method.' && (
                    <div className="mt-2 text-sm text-red-400">
                      Try signing in with your email and password instead, or
                      use a different Google account.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full bg-white hover:bg-zinc-50 text-black h-[45px] text-sm font-medium relative"
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <Loader className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <img
                src="/google.svg"
                alt="Google Logo"
                className="h-5 w-5 mr-2"
              />
            )}
            Sign in with Google
          </Button>

          <Button
            variant="outline"
            disabled
            className="w-full bg-primary hover:bg-primary/80 border-[#262626] text-white hover:text-white h-[45px] text-sm font-medium"
          >
            <span className="mr-2">🔒</span>
            Sign in with SAML/OIDC
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#262626]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#1C1C1C] px-2 text-[#A1A1A9]">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={state.email}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="john.doe@example.com"
                className="h-[45px] bg-transparent border-[#262626] text-white placeholder:text-[#525252]"
                disabled={state.isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-white"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#A1A1A9] hover:text-white"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={state.showPassword ? 'text' : 'password'}
                  value={state.password}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="h-[45px] bg-transparent border-[#262626] text-white pr-10"
                  disabled={state.isLoading}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white"
                  aria-label={
                    state.showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {state.showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-white hover:bg-zinc-100 text-black h-[45px] text-sm font-medium"
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  Signing in
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/signup"
            className="text-sm text-[#A1A1A9] hover:text-primary"
          >
            Don't have an account?
          </Link>
        </div>
      </div>
    </div>
  );
}
