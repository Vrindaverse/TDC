"use server";

import { validateCsrfToken } from "@/lib/csrf";
import { redirect } from "next/navigation";

export async function withCsrfProtection<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  ...args: T
): Promise<R> {
  const formData = args[args.length - 1];
  if (!(formData instanceof FormData)) {
    throw new Error("Expected FormData as last argument");
  }

  const clientToken = formData.get("_csrf") as string | null;
  const valid = await validateCsrfToken(clientToken ?? "");

  if (!valid) {
    throw new Error("Invalid CSRF token");
  }

  return action(...args);
}

export function withCsrf<T extends unknown[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const formData = args[args.length - 1];
    if (!(formData instanceof FormData)) {
      throw new Error("Expected FormData as last argument");
    }

    const clientToken = formData.get("_csrf") as string | null;
    const valid = await validateCsrfToken(clientToken ?? "");

    if (!valid) {
      throw new Error("Invalid CSRF token");
    }

    return action(...args);
  };
}