import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    localPatterns: [{ pathname: "**", search: "" }],
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/avatars/**" },
    ],
  },
};

export default nextConfig;
