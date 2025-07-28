"use client";

import { toast } from "sonner";
import { X } from "lucide-react";
import { auth } from "@/lib/auth";
import { API_ROUTES } from "@/lib/config";
import { Icons } from "@/components/ui/icons";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthApiClient from "@/lib/auth-api-client";
import { User } from "@/types/auth";

export default function VerifyEmailTokenPage() {
  const router = useRouter();
  const { token } = useParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    // If user is already verified, redirect to home
    const user = auth.getUser();
    if (user?.isVerified) {
      router.push("/");
      return;
    }

    const verifyToken = async () => {
      try {
        const authToken = auth.getToken();
        if (!authToken) {
          setStatus("error");
          setMessage("No authentication token found. Please login again.");
          return;
        }

        const data = await AuthApiClient.post<{
          status: string;
          message: string;
          data: {
            user: User;
          };
        }>(API_ROUTES.VERIFY_EMAIL, {
          verify_token: token,
        });

        if (data.status === "error") {
          setStatus("error");
          toast.error(data.message || "Verification failed");
          setMessage(data.message || "Verification failed");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully!");

        // Update user verification status
        const user = auth.getUser();
        if (user) {
          auth.updateUser(data.data.user);
          toast.success("Email verified successfully!");
          router.push("/chat");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.message || "Failed to verify email. Please try again."
        );
        toast.error(
          error.message || "Failed to verify email. Please try again."
        );
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus("error");
      setMessage("Invalid verification link");
      toast.error("Invalid verification link");
    }
  }, [token, router]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">
      <div className="hidden lg:block">
        <div className="h-screen w-full bg-[url('/signup_banner.jpg')] bg-cover bg-center" />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[450px]">
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

            {status === "verifying" && (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Verifying your email
                </h1>
                <p className="text-muted-foreground text-center">
                  Please wait while we verify your email address. This won't
                  take long.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <Icons.check className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Email Verified!
                </h1>
                <div className="text-center space-y-4 mb-8">
                  <p className="text-muted-foreground">{message}</p>
                  <p className="text-sm text-green-600 font-medium">
                    Your account has been successfully verified. You can now
                    access all features.
                  </p>
                </div>
                <div className="flex gap-4 w-full">
                  <Button
                    variant="default"
                    className="flex-1 py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    onClick={() => handleNavigation("/")}
                  >
                    <Icons.logo className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                  <X className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Verification Failed
                </h1>
                <p className="text-muted-foreground text-center mb-6">
                  {message}
                </p>
                <div className="flex gap-4 w-full">
                  {message.includes("login again") ? (
                    <Button
                      variant="default"
                      className="flex-1 py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      onClick={() => handleNavigation("/login")}
                    >
                      Back to Login
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="flex-1 py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      onClick={() => handleNavigation("/verify-email")}
                    >
                      Request New Verification Link
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
