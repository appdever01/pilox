'use client';

import ProtectedRoute from "@/components/ProtectedRoute";

export default function MintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}