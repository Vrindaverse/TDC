import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { VerifyForm } from "@/components/auth/verify-form";
import {
  getPendingContext,
  getProfile,
  getSession,
  hasVerifiedCookie,
} from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Verify your email",
};

export const instant = false;

export default async function VerifyPage() {
  const context = await getPendingContext();

  if (context) {
    return (
      <AuthCard
        label="verify"
        title="Check your email"
        description={`We sent a 6-digit code to ${context.email}. Enter it below to verify your address and finish creating your account.`}
        footer={
          <>
            Entered the wrong address?{" "}
            <AuthLink href="/register">Start over</AuthLink>
          </>
        }
      >
        <VerifyForm email={context.email} />
      </AuthCard>
    );
  }

  const session = await getSession();
  if (!session?.user) {
    redirect("/register");
  }

  const profile = await getProfile(session.user.id);
  if (profile) {
    redirect("/post-auth");
  }

  if (session.user.emailVerified || (await hasVerifiedCookie())) {
    redirect("/complete-profile");
  }

  return (
    <AuthCard
      label="verify"
      title="Check your email"
      description={`We sent a 6-digit code to ${session.user.email}. Enter it below to verify your email address.`}
      footer={
        <>
          Not the right account? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <VerifyForm email={session.user.email} />
    </AuthCard>
  );
}
