import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TS in production builds — typecheck runs separately (CI / locally)
  typescript: { ignoreBuildErrors: true },
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
