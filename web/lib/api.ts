import { getToken } from "./auth";

/**
 * In the browser, use same-origin `/api` (Next.js rewrites → Express).
 * On the server (SSR), hit Express directly.
 */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return p;
  }
  const base =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
  return `${base.replace(/\/$/, "")}${p}`;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function api<T>(path: string, opts: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.body && typeof opts.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  const auth = opts.auth !== false;
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(apiUrl(path), { ...opts, headers });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: string }).message)
        : res.statusText;
    throw new ApiError(msg || "Request failed", res.status, data);
  }
  return data as T;
}
