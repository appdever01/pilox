"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { auth } from "@/lib/auth";
import ApiClient from "@/lib/api-client";
import { API_ROUTES } from "@/lib/config";
import { useRouter } from "nextjs-toploader/app";
import { Input } from "@/components/ui/input";
import type { AuthResponse, LoginPayload } from "@/types/auth";
import { Button } from "@/components/ui/button";
import PublicRoute from "@/components/PublicRoute";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const payload: LoginPayload = {
        email: formData.email,
        password: formData.password,
      };
      const response = await ApiClient.post<AuthResponse>(
        API_ROUTES.LOGIN,
        payload
      );
      if (response.status == "success") {
        auth.setUser(response.data.user);
        if (response.data.user.token) {
          auth.setToken(response.data.user.token);
        }
        if (!response.data.user.isVerified) {
          await auth.resendVerificationEmail();
          auth.setCooldownTime();
          router.push("/verify-email");
        } else {
          router.push("/chat");
        }
        toast.success(response.message || "Logged in successfully!");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen grid lg:grid-cols-2 gap-0">
        <div className="hidden lg:block">
          <div className="h-screen w-full bg-[url('/login_banner.jpg')] bg-cover bg-center" />
        </div>

        <div className="flex flex-col items-center justify-center p-8">
          <div className="lg:hidden w-full max-w-[400px] mb-8">
            <Image
              src="/logo.png"
              alt="Logo"
              width={10}
              height={10}
              className="w-auto h-5"
              priority
            />
          </div>

          <div className="w-full max-w-[400px] space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Log in</h1>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="py-6"
                />
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="py-6"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Button
                className="w-full py-6 bg-gradient-to-r from-primary to-primary/50 hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center text-xs my-6">
              <span className="text-muted-foreground relative before:absolute before:right-full before:top-1/2 before:w-32 before:h-px before:bg-border after:absolute after:left-full after:top-1/2 after:w-32 after:h-px after:bg-border px-2">
                or continue with
              </span>
            </div>

            <GoogleAuthButton />

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/faqs" className="hover:text-primary">
                FAQs
              </Link>
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
