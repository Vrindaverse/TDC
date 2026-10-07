"use server";

import { cookies } from "next/headers";
import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";

const CSRF_COOKIE_NAME = "tdc_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHmac("sha256", process.env.NEON_AUTH_COOKIE_SECRET ?? "")
    .update(token)
    .digest("hex");
}

export async function getCsrfToken(): Promise<string> {
  const store = await cookies();
  let token = store.get(CSRF_COOKIE_NAME)?.value;

  if (!token) {
    token = generateToken();
    const hashed = hashToken(token);
    store.set(CSRF_COOKIE_NAME, hashed, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: CSRF_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return token;
}

export async function validateCsrfToken(clientToken: string): Promise<boolean> {
  const store = await cookies();
  const hashedCookie = store.get(CSRF_COOKIE_NAME)?.value;

  if (!hashedCookie || !clientToken) return false;

  const hashedClient = hashToken(clientToken);

  try {
    return timingSafeEqual(
      Buffer.from(hashedCookie),
      Buffer.from(hashedClient)
    );
  } catch {
    return false;
  }
}

export async function rotateCsrfToken(): Promise<string> {
  const store = await cookies();
  const token = generateToken();
  const hashed = hashToken(token);
  store.set(CSRF_COOKIE_NAME, hashed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CSRF_COOKIE_MAX_AGE,
    path: "/",
  });
  return token;
}