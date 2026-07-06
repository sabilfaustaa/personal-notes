import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@apple-notes/shared", "@apple-notes/config"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
