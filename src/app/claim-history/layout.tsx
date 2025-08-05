'use client';

import ProtectedRoute from "@/components/ProtectedRoute";

export default function ClaimHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}