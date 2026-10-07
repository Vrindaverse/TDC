/**
 * Maps Neon Auth / Better Auth errors to safe user-facing messages.
 * Technical details are only ever logged on the server, never returned.
 */
export function friendlyAuthError(error: unknown): string {
  const err = error as { code?: string; message?: string } | null;
  const raw = `${err?.code ?? ""} ${err?.message ?? ""}`.toLowerCase();

  if (
    raw.includes("invalid_email_or_password") ||
    (raw.includes("invalid") &&
      (raw.includes("password") || raw.includes("credential")))
  ) {
    return "Incorrect email or password.";
  }
  if (raw.includes("not verified") || raw.includes("email_not_verified")) {
    return "Please verify your email first. We can resend you a code.";
  }

  if (
    raw.includes("already exist") ||
    raw.includes("user_already_exists") ||
    raw.includes("exists")
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (
    raw.includes("maybe too many attempts") ||
    raw.includes("too_many_attempts") ||
    raw.includes("too many attempts")
  ) {
    return "Too many code attempts. Please request a fresh code and try again.";
  }
  if (raw.includes("rate") || raw.includes("too many") || raw.includes("limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (raw.includes("password")) {
    return "That password does not meet the requirements. Please try a different one.";
  }
  if (
    raw.includes("network") ||
    raw.includes("timeout") ||
    raw.includes("dns") ||
    raw.includes("fetch") ||
    raw.startsWith("502")
  ) {
    return "We could not reach the authentication service. Please try again.";
  }
  if (raw.includes("origin") || raw.includes("trusted")) {
    return "This request was blocked. Please try again from the site directly.";
  }
  if (
    raw.includes("otp") ||
    raw.includes("code") ||
    raw.includes("verif") ||
    raw.includes("expired")
  ) {
    return "That code is invalid or has expired. Codes last 15 minutes — request a new one and enter it right away.";
  }
  return "Something went wrong. Please try again.";
}
