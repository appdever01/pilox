"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { auth } from "@/lib/auth";
import { Loader } from "./ui/loader";

export default function PrivateRoute({
  children,
  requireVerification = true,
}: {
  children: React.ReactNode;
  requireVerification?: boolean;
}) {
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await auth.verifyAuth();
      const user = auth.getUser();

      if (!isValid || !user) {
        router.push("/login");
        return;
      }

      if (requireVerification && !user.isVerified) {
        router.push("/verify-email");
        return;
      }

      setShouldRender(true);
    };

    checkAuth();
  }, [router, requireVerification]);

  if (!shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
