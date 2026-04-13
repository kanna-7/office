"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, type StoredUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    if (u.role !== "admin") {
      router.replace("/employee");
      return;
    }
    setUser(u);
    setHydrated(true);
  }, [router]);

  if (!hydrated) {
    return <div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">Loading…</div>;
  }

  return <AppShell role="admin">{children}</AppShell>;
}
