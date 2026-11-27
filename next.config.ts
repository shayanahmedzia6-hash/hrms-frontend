import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Browser requests stay same-origin so the HttpOnly refresh cookie works.
  async rewrites() {
    return [{
      source: "/api/v1/:path*",
      destination: `${process.env.API_INTERNAL_BASE_URL ?? "http://localhost:4000/api/v1"}/:path*`,
    }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
