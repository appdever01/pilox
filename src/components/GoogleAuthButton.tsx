"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import ApiClient from "@/lib/api-client";
import { API_ROUTES } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import type { AuthResponse } from "@/types/auth";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

interface GoogleAuthPayload {
  token: string;
  name: string;
  email: string;
  picture: string;
  referral?: string;
}

export default function GoogleAuthButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const referralCode = searchParams.get("referral");

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google login success, tokenResponse:", tokenResponse);
      setIsLoading(true);
      try {
        console.log("Fetching user info from Google API...");
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        if (!userInfoResponse.ok) {
          console.error("Google API error:", await userInfoResponse.text());
          throw new Error(`Google API error: ${userInfoResponse.status}`);
        }

        const userInfo = await userInfoResponse.json();
        console.log("Fetched userInfo:", userInfo);

        if (!userInfo.email) {
          console.error("Missing email in Google response:", userInfo);
          throw new Error("Could not retrieve email from Google");
        }

        const payload: GoogleAuthPayload = {
          token: tokenResponse.access_token,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture || "",
        };

        if (referralCode) {
          payload.referral = referralCode;
        }

        console.log("Sending auth request to backend:", payload);
        try {
          const apiResponse = await ApiClient.post<AuthResponse>(
            API_ROUTES.GOOGLE_AUTH,
            payload
          );
          console.log("API response:", apiResponse);

          if (apiResponse.status === "success") {
            auth.setUser(apiResponse.data.user);
            if (apiResponse.data.user.token) {
              auth.setToken(apiResponse.data.user.token);
            }
            toast.success("Logged in successfully!");
            router.push("/");
          } else {
            throw new Error(apiResponse.message || "Authentication failed");
          }
        } catch (apiError: any) {
          console.error("Backend API error:", apiError);
          toast.error(apiError.message || "Authentication failed");
        }
      } catch (error: any) {
        console.error("Google auth process error:", error);

        toast.error(error.message || "Authentication failed");
      } finally {
        setIsLoading(false);
      }
    },

    onError: (error) => {
      console.error("Google login error:", error);
      toast.error("Google authentication failed");
      setIsLoading(false);
    },
    scope: "email profile",
  });

  return (
    <Button
      variant="outline"
      className="w-full py-6 hover:bg-transparent transition-all duration-300"
      type="button"
      onClick={() => {
        handleGoogleAuth();
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Authenticating...
        </>
      ) : (
        <>
          <Image
            src="/google_icon.png"
            alt="Google"
            width={32}
            height={32}
            className="mr-1"
          />
          Continue with Google
        </>
      )}
    </Button>
  );
}
