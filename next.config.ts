import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Prerendered pages query Neon at build time; give slow/first queries headroom
  // instead of hitting the 60s default and burning retries.
  staticPageGenerationTimeout: 120,
  experimental: {
    // Cap build workers so small build machines don't thrash swap.
    cpus: 4,
  },
  images: {
    localPatterns: [{ pathname: "**", search: "" }],
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/avatars/**" },
    ],
  },
};

export default nextConfig;
