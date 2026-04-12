"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setSession, type StoredUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SetupAdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bootstrapBlocked, setBootstrapBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBootstrapBlocked(false);
    setLoading(true);
    try {
      const res = await api<{ token: string; user: StoredUser }>("/api/auth/setup-admin", {
        method: "POST",
        auth: false,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      setSession(res.token, res.user);
      router.replace("/admin");
    } catch (err) {
      if (err instanceof ApiError) {
        const blocked =
          err.status === 403 ||
          /bootstrap|already exists|account already/i.test(err.message);
        setBootstrapBlocked(blocked);
        setError(err.message);
      } else if (err instanceof TypeError && String(err.message).includes("fetch")) {
        setError(
          "Cannot reach API. Is the server running on port 4000? If the app is on a different port than your API CORS allow-list, add it to CLIENT_ORIGIN in server/.env."
        );
      } else {
        setError(err instanceof Error ? err.message : "Setup failed");
      }
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
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-corp-900">Bootstrap admin</h1>
          <p className="mt-1 text-sm text-muted">Only when the database has no users.</p>
        </div>
        {bootstrapBlocked ? (
          <Card>
            <p className="text-sm leading-relaxed text-ink">
              Your database already has at least one user, so <strong>first-time setup is turned off</strong> for
              security. Use the account you created earlier, or ask another admin to add you.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-corp-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-corp-800"
              >
                Go to sign in
              </Link>
            </div>
            <p className="mt-4 border-t border-corp-100 pt-4 text-xs leading-relaxed text-muted">
              Developers only: to run bootstrap again, remove all documents from the{" "}
              <code className="rounded bg-corp-100 px-1 py-0.5 font-mono text-corp-800">users</code> collection in
              MongoDB (Atlas → Browse Collections), then reload this page.
            </p>
          </Card>
        ) : (
          <Card>
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <Label>Full name</Label>
                <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input className="mt-1.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button variant="primary" type="submit" disabled={loading} className="w-full rounded-md py-2.5">
                {loading ? "Creating…" : "Create admin"}
              </Button>
            </form>
          </Card>
        )}
        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/login" className="font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
