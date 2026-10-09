import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Prerendered pages query Neon at build time; give slow/first queries headroom
  // instead of hitting the 60s default and burning retries.
  staticPageGenerationTimeout: 120,
  experimental: {
    cpus: 4,
  },
  images: {
    localPatterns: [{ pathname: "**", search: "" }],
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/avatars/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
