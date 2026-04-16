import type { NextConfig } from "next";

const basePath =
  process.env.GITHUB_PAGES === "true" ? "/etha-landing" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
