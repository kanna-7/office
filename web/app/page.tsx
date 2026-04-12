"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const u = getStoredUser();
    if (!u) router.replace("/login");
    else if (u.role === "admin") router.replace("/admin");
    else router.replace("/employee");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">Loading…</div>
  );
}
