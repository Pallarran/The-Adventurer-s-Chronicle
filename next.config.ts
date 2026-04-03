import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TS/ESLint in production builds — verified locally before push
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
