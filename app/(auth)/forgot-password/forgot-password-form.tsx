'use client';

import { CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sendResetLink } from '@/actions/users';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@mosespace/toast';
import { Button } from '@/components/ui/button';
import CustomText from '@/components/back-end/re-usable-inputs/text-reusable';

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<any>();
  const [passErr, setPassErr] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const handleResend = async () => {
    setIsResending(true);

    // Simulate API call
    await sendResetLink(email);

    // Start countdown timer (60 seconds)
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResending(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  async function onSubmit(data: any) {
    try {
      setLoading(true);
      console.log('Data:', data);
      const res = await sendResetLink(data.email);
      if (res?.status === 404) {
        setLoading(false);
        setPassErr(res?.error ?? '');
        return;
      }
      toast.success(
        'Successfully',
        'Reset Instructions sent, Check your email',
      );
      setLoading(false);
      setEmail(data.email);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      console.error('Network Error:', error);
    }
  }
  return (
    <div className="w-full lg:grid h-screen lg:min-h-[600px]  relative ">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6 mt-10 md:mt-0">
          <div className="absolute left-1/3 top-14 md:top-5 md:left-5">
            {/* <Logo /> */}
          </div>
          {success ? (
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="space-y-3">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle className="text-center text-2xl">
                  Check your email
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center text-gray-600">
                  We've sent password reset instructions to:
                  <div className="mt-2 font-medium text-gray-900">{email}</div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p>
                        The email might take a few minutes to arrive. Don't
                        forget to check your spam folder!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3">
                <div className="text-sm text-center text-gray-600">
                  Didn't receive the email?
                </div>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full"
                >
                  {resendTimer > 0
                    ? `Resend available in ${resendTimer}s`
                    : 'Resend email'}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="">
              <div className="grid gap-2 mt-10 md:mt-0">
                <h1 className="text-3xl font-bold">Forgot Password?</h1>
                <p className="text-muted-foreground text-sm">
                  No worries, we'll send you reset instructions
                </p>
              </div>
              <div className="">
                <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                  <CustomText
                    register={register}
                    errors={errors}
                    label="Email Address"
                    name="email"
                    placeholder="email"
                  />
                  {passErr && <p className="text-red-500 text-xs">{passErr}</p>}
                  <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      Save
                    </Button>
                  </div>
                </form>

                <p className="mt-6 text-sm text-gray-500">
                  Remember password ?{' '}
                  <Link
                    href="/login"
                    className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
