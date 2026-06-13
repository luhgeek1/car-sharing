import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "../docs",
  basePath: "/car-sharing",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/media-public/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/media-public/**",
      },
    ],
  },
};

export default nextConfig;
