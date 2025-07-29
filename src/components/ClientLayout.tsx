"use client";

import { Navbar } from "./landing/Navbar";
import { Footer } from "./landing/Footer";
import { auth } from "@/lib/auth";
import { Loader } from "./ui/loader";
import { UserNavbar } from "./dashboard/UserNavbar";
import { useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import { usePathname, useRouter } from "next/navigation";

// Initialize auth state before first render
const initialToken = typeof window !== "undefined" ? auth.getToken() : null;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ].includes(`/${pathname.split("/")[1]}`);
  const noFooterPages = [
    "/chat",
    "/generate-pdf",
    "/pdf-to-images",
    "/images-to-pdf",
    "/convert-documents",
    "/youtube-chat",
    "/pdf-viewer",
    "/referrals",
    "/settings",
    "/feedback",
    "/wagwan",
    "/credit-history",
    "/latex-renderer",
    "/rearrange-pdf",
    "/feedback-history",
    "/verify-email",
  ].includes(`/${pathname.split("/")[1]}`);
  const isChatPage = pathname?.startsWith("/chat/");

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthPage) {
        const isValid = await auth.verifyAuth();
        setShouldRender(true);
        setIsLoading(false);
      } else {
        setShouldRender(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthPage]);

  if (!shouldRender) {
    return <Loader />;
  }

  return (
    <>
      <meta name="theme-color" content="#2563eb" />
      <NextTopLoader
        color="#2563eb"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px #2563eb,0 0 5px #2563eb"
      />
      {isLoading && !isAuthPage && <Loader />}
      {!isAuthPage && <UserNavbar />}
      <main
        className={`flex-1 ${pathname?.startsWith("/chat/") ? "flex" : ""} ${!isAuthPage ? "mt-16" : ""}`}
      >
        {children}
      </main>
      {!isAuthPage && !noFooterPages && <Footer />}
    </>
  );
}
