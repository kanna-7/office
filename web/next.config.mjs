/** @type {import('next').NextConfig} */
const apiTarget = process.env.API_PROXY_TARGET || "http://127.0.0.1:7896";

const nextConfig = {
  reactStrictMode: true,
  /** Dev: browser calls /api/* on the Next port → proxied to Express (no CORS, no wrong host). */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
