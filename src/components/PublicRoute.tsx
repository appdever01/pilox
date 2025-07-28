"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { Loader } from "./ui/loader";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await auth.verifyAuth();
      const user = auth.getUser();

      if (isValid && user?.isVerified) {
        router.replace("/chat");
      } else {
        setShouldRender(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
