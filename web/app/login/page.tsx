"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setSession, type StoredUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ token: string; user: StoredUser }>("/api/auth/login", {
        method: "POST",
        auth: false,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setSession(res.token, res.user);
      router.replace(res.user.role === "admin" ? "/admin" : "/employee");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-corp-900 text-xs font-bold text-white">
            OP
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-corp-900">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Employee management & attendance</p>
        </div>
        <Card>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1.5"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                className="mt-1.5"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button variant="primary" type="submit" disabled={loading} className="w-full rounded-md py-2.5">
              {loading ? "Signing in…" : "Continue"}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-xs text-muted">
          First time?{" "}
          <Link href="/setup" className="font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline">
            Create admin
          </Link>
        </p>
      </div>
    </div>
  );
}
