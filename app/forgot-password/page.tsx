import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getResetEmail, getSession } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Forgot password",
};

export const instant = false;

async function SignedInRedirect() {
  const session = await getSession();
  if (session?.user) {
    redirect("/post-auth");
  }
  return null;
}

export default async function ForgotPasswordPage() {
  const resetEmail = await getResetEmail();
  if (resetEmail) {
    redirect("/reset-password");
  }

  return (
    <AuthCard
      label="reset"
      title="Forgot your password?"
      description="We'll email a 6-digit code to your account. Enter it on the next screen to set a new password. The code lasts 15 minutes."
      footer={
        <>
          Remembered it? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <Suspense>
        <SignedInRedirect />
      </Suspense>
      <ForgotPasswordForm />
    </AuthCard>
  );
}