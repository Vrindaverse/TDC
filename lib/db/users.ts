import { findUserByEmail, isEmailVerified as checkEmailVerified } from "@/lib/neon-auth";

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const user = await findUserByEmail(email);
  return user?.id ?? null;
}

export async function isEmailVerified(email: string): Promise<boolean> {
  return checkEmailVerified(email);
}
