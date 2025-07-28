"use client";

import Link from "next/link";
import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import { API_ROUTES } from "@/lib/config";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.FORGOT_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setIsEmailSent(true);
      } else {
        throw new Error(data.message || "Failed to send reset link");
      }
    } catch (error: any) {
      toast.error(
        error.message || "Something went wrong. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">
      <div className="hidden lg:block p-8">
        <div className="h-full w-full rounded-[32px] overflow-hidden relative bg-[url('/reset_banner.jpg')] bg-cover bg-center" />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Reset password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to reset your password
            </p>
          </div>

          {!isEmailSent ? (
            <>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={handleEmailChange}
                    className="py-6"
                  />
                </div>
                <Button className="w-full py-6" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Reset Link
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Icons.check className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent you a link to reset your password. The link will
                  expire in 10 minutes.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full py-6 mt-4 hover:bg-transparent"
                onClick={() => setIsEmailSent(false)}
              >
                Back to reset password
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
