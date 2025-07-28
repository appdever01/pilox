"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { Loader } from "./ui/loader";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!auth.getToken()) {
      router.replace('/login');
    }
  }, [router]);

  if (!auth.getToken()) {
    return <Loader />;
  }

  return <>{children}</>;
} 