export const CONFIG = {
  auth: {
    pendingTtlMs: 60 * 60 * 24 * 1000,
    csrfCookieMaxAge: 60 * 60 * 24 * 7,
    verifiedCookieMaxAge: 60 * 15,
    joinVerifiedMaxAge: 60 * 20,
    resetMaxAge: 60 * 15,
    joinShadowMaxAge: 60 * 20,
  },

  avatar: {
    maxBytes: 5 * 1024 * 1024,
    extensions: ["png", "jpg", "webp", "gif", "avif"] as const,
    cacheControl: "public, max-age=31536000, immutable",
  },

  poster: {
    maxBytes: 5 * 1024 * 1024,
  },

  rateLimit: {
    login: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
    register: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
    verify: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
    forgotPassword: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
    resetPassword: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
    resend: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  },

  pagination: {
    adminDefaultLimit: 50,
    adminMaxLimit: 100,
  },
} as const;

export type Config = typeof CONFIG;