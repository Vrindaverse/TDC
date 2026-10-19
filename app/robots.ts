import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login", "/register", "/verify", "/forgot-password", "/reset-password", "/complete-profile", "/post-auth"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: "https://tdc-six.vercel.app/sitemap.xml",
  };
}