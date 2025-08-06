"use client";

import Link from "next/link";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SignUpPayload } from "@/types/auth";
import PublicRoute from "@/components/PublicRoute";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateFullName = (name: string): boolean => {
    const words = name.trim().split(/\s+/);

    const validWords = words.every((word) => word.length >= 3);

    return words.length >= 2 && validWords;
  };

  const validatePasswords = (
    password: string,
    confirmPassword: string
  ): { isValid: boolean; message?: string } => {
    if (password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters long",
      };
    }

    if (password !== confirmPassword) {
      return { isValid: false, message: "Passwords don't match" };
    }

    return { isValid: true };
  };

  const validateReferralCode = (
    code: string
  ): { isValid: boolean; message?: string } => {
    if (!code) return { isValid: true }; // Optional field

    if (code.includes(" ")) {
      return { isValid: false, message: "Referral code cannot contain spaces" };
    }

    if (code.length !== 6) {
      return {
        isValid: false,
        message: "Referral code must be exactly 6 characters",
      };
    }

    return { isValid: true };
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!validateFullName(formData.name)) {
      toast.error(
        "Please enter your full name (first & last name, minimum 3 characters each)"
      );
      return;
    }

    const passwordValidation = validatePasswords(
      formData.password,
      formData.confirmPassword
    );
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }

    const referralValidation = validateReferralCode(formData.referralCode);
    if (!referralValidation.isValid) {
      toast.error(referralValidation.message);
      return;
    }

    setIsLoading(true);

    try {
      const payload: SignUpPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      if (formData.referralCode) {
        payload.referral = formData.referralCode;
      }
      await auth.signup(payload, router);
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen grid lg:grid-cols-2 gap-0">
        <div className="hidden lg:block">
          <div className="h-screen w-full bg-[url('/signup_banner.jpg')] bg-cover bg-center" />
        </div>

        <div className="flex flex-col items-center justify-center p-8">
          <div className="lg:hidden w-full max-w-[400px] mb-8">
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-auto h-20"
              priority
            />
          </div>

          <div className="w-full max-w-[400px] space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Create Account</h1>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="py-6"
                />
              </div>
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
              <div>
                <div className="relative">
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoComplete="new-password"
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
              </div>
              <div>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="py-6"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Input
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Referral Code (Optional)"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="py-6"
                />
              </div>
              <Button
                className="w-full py-6 bg-gradient-to-r from-primary to-primary/50 hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>



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

