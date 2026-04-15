import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_PAGES === "true" ? "/etha-landing" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
