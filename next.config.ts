import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    // Avoid a Next.js dev-only Segment Explorer manifest bug in embedded browsers.
    devtoolSegmentExplorer: false
  }
};

export default nextConfig;
