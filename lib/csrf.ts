"use server";

import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "node:crypto";

const CSRF_COOKIE_NAME = "tdc_csrf_v2";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function getCsrfToken(): Promise<string> {
  const store = await cookies();
  store.delete("tdc_csrf");
  let token = store.get(CSRF_COOKIE_NAME)?.value;

  if (!token) {
    token = generateToken();
    store.set(CSRF_COOKIE_NAME, token, {
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
  const cookieToken = store.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieToken || !clientToken) return false;

  try {
    return timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(clientToken)
    );
  } catch {
    return false;
  }
}

export async function rotateCsrfToken(): Promise<string> {
  const store = await cookies();
  const token = generateToken();
  store.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CSRF_COOKIE_MAX_AGE,
    path: "/",
  });
  return token;
}