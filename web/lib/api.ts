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
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:7896";
  return `${base.replace(/\/$/, "")}${p}`;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  response: { data: unknown };
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
    this.response = { data: body };
  }
}

type ApiOptions = RequestInit & { auth?: boolean; responseType?: "json" | "blob" | "text" };

interface ApiHelper {
  <T = any>(path: string, opts?: ApiOptions): Promise<T>;
  get<T = any>(path: string, opts?: ApiOptions): Promise<T>;
  post<T = any>(path: string, body?: unknown, opts?: ApiOptions): Promise<T>;
  put<T = any>(path: string, body?: unknown, opts?: ApiOptions): Promise<T>;
  patch<T = any>(path: string, body?: unknown, opts?: ApiOptions): Promise<T>;
  delete<T = any>(path: string, opts?: ApiOptions): Promise<T>;
}

const api = (async function <T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.body && typeof opts.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  const auth = opts.auth !== false;
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const { responseType, ...fetchOpts } = opts;
  const res = await fetch(apiUrl(path), { ...fetchOpts, headers });

  if (!res.ok) {
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    const msg =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: string }).message)
        : res.statusText;
    throw new ApiError(msg || "Request failed", res.status, data);
  }

  if (responseType === "blob") {
    return (await res.blob()) as unknown as T;
  }

  if (responseType === "text") {
    return (await res.text()) as unknown as T;
  }

  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : null) as T;
  } catch {
    return text as unknown as T;
  }
}) as ApiHelper;

api.get = function <T = any>(path: string, opts: ApiOptions = {}) {
  return api<T>(path, { ...opts, method: "GET" });
};

api.post = function <T = any>(path: string, body?: unknown, opts: ApiOptions = {}) {
  const request: ApiOptions = {
    ...opts,
    method: "POST",
    body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : (opts.body || body),
  };
  return api<T>(path, request);
};

api.put = function <T = any>(path: string, body?: unknown, opts: ApiOptions = {}) {
  const request: ApiOptions = {
    ...opts,
    method: "PUT",
    body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : (opts.body || body),
  };
  return api<T>(path, request);
};

api.patch = function <T = any>(path: string, body?: unknown, opts: ApiOptions = {}) {
  const request: ApiOptions = {
    ...opts,
    method: "PATCH",
    body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : (opts.body || body),
  };
  return api<T>(path, request);
};

api.delete = function <T = any>(path: string, opts: ApiOptions = {}) {
  return api<T>(path, { ...opts, method: "DELETE" });
};

export { api };
