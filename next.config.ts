import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Limit build worker count to prevent OOM in Docker
    cpus: 2,
  },
};

export default nextConfig;
