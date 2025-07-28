"use client";

import Link from "next/link";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import { Icons } from "@/components/ui/icons";
import { useRouter } from "nextjs-toploader/app";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(120);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const user = auth.getUser();

  useEffect(() => {
    if (user?.isVerified) {
      router.push("/");
    }
  }, [router, user]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await auth.resendVerificationEmail();
      toast.success("Verification email resent successfully!");
      setCanResend(false);
      setCountdown(120);
    } catch (error: any) {
      if (error.message.includes("Please login again")) {
        toast.error("Session expired. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(error.message || "Failed to resend verification email");
      }
    } finally {
      setIsResending(false);
    }
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">
      <div className="hidden lg:block">
        <div className="h-screen w-full bg-[url('/signup_banner.jpg')] bg-cover bg-center" />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full animate-gradient" />
              <div className="relative rounded-full bg-gradient-to-tr from-primary/10 to-transparent p-4 backdrop-blur-sm">
                <Icons.mail className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-3 mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Check your email
              </h1>
              <p className="text-base text-muted-foreground max-w-sm">
                We've sent a verification link to{" "}
                <span className="font-medium text-primary">{user.email}</span>.
                Please click the link to verify your account.
              </p>
            </div>

            <div className="w-full space-y-4">
              <Button
                variant="default"
                className="w-full py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300"
                onClick={handleResendEmail}
                disabled={!canResend || isResending}
              >
                {isResending ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Sending verification email...
                  </>
                ) : (
                  <>
                    {canResend ? (
                      "Resend verification email"
                    ) : (
                      <span className="flex items-center gap-2">
                        Wait {formatTime(countdown)} to resend
                        <Icons.timer className="h-4 w-4 animate-pulse" />
                      </span>
                    )}
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Wrong email?{" "}
                  <Link
                    href="/signup"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Change email address
                  </Link>
                </p>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground/60">
                    or
                  </span>
                </div>
              </div>

              <Link href="/login" className="block">
                <Button
                  variant="outline"
                  className="w-full py-6 border-gray-200 hover:bg-gray-50/50 transition-colors duration-300"
                >
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
