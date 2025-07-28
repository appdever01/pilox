"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/signup/[referral]",
  "/verify-email",
  "/forgot-password",
  "/reset-password/[token]",
  "/pdf-viewer",
  "/convert-documents",
  "/images-to-pdf",
  "/latex-renderer",
  "/pdf-to-images",
  "/pricing",
  "/rearrange-pdf",
  "/terms",
  "/privacy",
];

export default function VerificationCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const verifyEmail = "/verify-email/[token]";

  const isVerifyEmail = pathname.includes(verifyEmail);

  useEffect(() => {
    const user = auth.getUser();
    if (
      user &&
      !user.isVerified &&
      !PUBLIC_PATHS.includes(pathname) &&
      !isVerifyEmail
    ) {
      router.push("/verify-email");
    }
  }, [pathname]);

  useEffect(() => {
    const isAuthenticated = auth.isAuthenticated();
    if (!isAuthenticated && !isPublicPath(pathname)) {
      router.push("/login");
    }
  }, [pathname]);

  const isPublicPath = (path: string): boolean => {
    // Check static paths
    if (PUBLIC_PATHS.includes(path)) return true;

    // Match dynamic paths like `/signup/[referral]`
    const dynamicPaths = [/^\/signup\/[^/]+$/, /^\/reset-password\/[^/]+$/]; // Regex to match `/signup/<something>` and `/reset-password/<something>`
    return dynamicPaths.some((regex) => regex.test(path));
  };

  return <>{children}</>;
}
