"use client";

import PrivateRoute from "@/components/PrivateRoute";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute requireVerification={true}>
      {children}
    </PrivateRoute>
  );
}
