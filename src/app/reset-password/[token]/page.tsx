"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL, API_ROUTES } from "@/lib/config";
import ApiClient from "@/lib/api-client";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });

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
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.RESET_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reset_token: token,
            password: formData.password,
            confirm_password: formData.confirm_password,
          }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setIsSuccess(true);
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">
      <div className="hidden lg:block p-8">
        <div className="h-full w-full rounded-[32px] overflow-hidden relative bg-[url('/password_banner.jpg')] bg-cover bg-center" />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Set new password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          {!isSuccess ? (
            <>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    name="password"
                    placeholder="New Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
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
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    name="confirm_password"
                    placeholder="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="py-6"
                  />
                </div>
                <Button className="w-full py-6" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Icons.check className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Password Updated</h3>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully updated. You can now log
                  in with your new password.
                </p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full py-6 mt-4 hover:bg-transparent"
            onClick={() => router.push("/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
