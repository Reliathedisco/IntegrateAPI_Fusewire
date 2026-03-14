import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/account",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
