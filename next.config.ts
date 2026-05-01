import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["lucide-react"],
  images: {
    domains: ["i.ibb.co"],
  },
};

export default nextConfig;