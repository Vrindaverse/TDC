import { and, count, eq, gt } from "drizzle-orm";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { contactMessages, pendingRegistrations, profiles } from "@/lib/db/schema";
import { CONFIG } from "@/lib/config";

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.getSession>>["data"]
>;

const PENDING_EMAIL_COOKIE = "tdc_pending_email";
const VERIFIED_COOKIE = "tdc_email_verified";
const COOKIE_MAX_AGE = CONFIG.auth.csrfCookieMaxAge;
const VERIFIED_COOKIE_MAX_AGE = CONFIG.auth.verifiedCookieMaxAge;
const JOIN_VERIFIED_COOKIE = "tdc_join_verified";
const JOIN_VERIFIED_MAX_AGE = CONFIG.auth.joinVerifiedMaxAge;
const RESET_EMAIL_COOKIE = "tdc_reset_email";
const RESET_MAX_AGE = CONFIG.auth.resetMaxAge;
const JOIN_SHADOW_COOKIE = "tdc_join_shadow";

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const store = await cookies();
  const cookieHeader = store.toString();
  if (!cookieHeader.includes("session_token")) return null;
  const { data } = await auth.getSession();
  return data ?? null;
});

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export const getProfile = cache(async (userId: string) => {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
});

export const getUnreadMessageCount = cache(async (): Promise<number> => {
  const [unreadRow] = await db
    .select({ count: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "new"));
  return Number(unreadRow?.count ?? 0);
});

export async function requireProfile() {
  const session = await requireAuth();
  const profile = await getProfile(session.user.id);
  if (!profile) {
    redirect(await resolvePostLoginRedirect());
  }
  return { session, profile };
}

export async function requireAdmin() {
  const session = await requireAuth();
  const profile = await getProfile(session.user.id);
  if (!profile) {
    redirect("/complete-profile");
  }
  if (profile.role !== "ADMIN") {
    redirect("/profile");
  }
  return { session, profile };
}

export async function getPendingRegistration(email: string) {
  const rows = await db
    .select()
    .from(pendingRegistrations)
    .where(
      and(
        eq(pendingRegistrations.email, email.toLowerCase()),
        gt(pendingRegistrations.expiresAt, new Date())
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function setPendingEmailCookie(email: string) {
  const store = await cookies();
  store.set(PENDING_EMAIL_COOKIE, email.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearPendingEmailCookie() {
  const store = await cookies();
  store.delete(PENDING_EMAIL_COOKIE);
}

export async function markEmailVerifiedCookie() {
  const store = await cookies();
  store.set(VERIFIED_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VERIFIED_COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function hasVerifiedCookie() {
  const store = await cookies();
  return store.get(VERIFIED_COOKIE)?.value === "1";
}

export async function setJoinVerifiedCookie(email: string) {
  const store = await cookies();
  store.set(JOIN_VERIFIED_COOKIE, email.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: JOIN_VERIFIED_MAX_AGE,
    path: "/",
  });
}

export async function getJoinVerifiedEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(JOIN_VERIFIED_COOKIE)?.value ?? null;
}

export async function setResetEmailCookie(email: string) {
  const store = await cookies();
  store.set(RESET_EMAIL_COOKIE, email.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: RESET_MAX_AGE,
    path: "/",
  });
}

export async function getResetEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(RESET_EMAIL_COOKIE)?.value ?? null;
}

export async function clearResetEmailCookie() {
  const store = await cookies();
  store.delete(RESET_EMAIL_COOKIE);
}

const JOIN_SHADOW_MAX_AGE = CONFIG.auth.joinShadowMaxAge;

export async function setJoinShadowCookie(email: string) {
  const store = await cookies();
  store.set(JOIN_SHADOW_COOKIE, email.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: JOIN_SHADOW_MAX_AGE,
    path: "/",
  });
}

export async function getJoinShadowEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(JOIN_SHADOW_COOKIE)?.value ?? null;
}

export async function clearJoinShadowCookie() {
  const store = await cookies();
  store.delete(JOIN_SHADOW_COOKIE);
}

/**
 * Resolves the pending registration the current browser is working on,
 * preferring the Neon Auth session email, then the httpOnly staging cookie.
 * The TDC fields themselves always come from the server-side row — never
 * from the client.
 */
export async function getPendingContext(): Promise<{
  email: string;
  pending: NonNullable<Awaited<ReturnType<typeof getPendingRegistration>>>;
} | null> {
  const session = await getSession();
  const candidates: string[] = [];
  if (session?.user?.email) candidates.push(session.user.email);
  const store = await cookies();
  const cookieEmail = store.get(PENDING_EMAIL_COOKIE)?.value;
  if (cookieEmail) candidates.push(cookieEmail);

  for (const email of candidates) {
    const pending = await getPendingRegistration(email);
    if (pending) return { email, pending };
  }
  return null;
}

/**
 * Where to send a user right after authentication. Only ever called with a
 * server-derived session — never with client-supplied identity.
 */
export async function resolvePostLoginRedirect(): Promise<string> {
  const session = await getSession();
  if (!session?.user) return "/login";

  const profile = await getProfile(session.user.id);
  if (profile) {
    return profile.role === "ADMIN" ? "/admin" : "/profile";
  }

  const pending = await getPendingRegistration(session.user.email);
  if (pending) return "/verify";

  if (!session.user.emailVerified && !(await hasVerifiedCookie())) {
    return "/verify";
  }

  return "/complete-profile";
}
