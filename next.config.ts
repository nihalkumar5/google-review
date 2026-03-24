import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.VERCEL ? ".next" : ".next-app"
};

export default nextConfig;
