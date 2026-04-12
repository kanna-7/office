"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const u = getStoredUser();
    if (!u) router.replace("/login");
    else if (u.role !== "admin") router.replace("/employee");
  }, [router]);
  const u = getStoredUser();
  if (!u || u.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">Loading…</div>;
  }
  return <AppShell role="admin">{children}</AppShell>;
}
