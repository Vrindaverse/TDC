import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getResetEmail } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Reset password",
};

export const instant = false;

export default async function ResetPasswordPage() {
  const email = await getResetEmail();
  if (!email) {
    redirect("/forgot-password");
  }

  return (
    <AuthCard
      label="reset"
      title="Set a new password"
      description={`Enter the 6-digit code we emailed to ${email}, then choose a new password.`}
      footer={
        <>
          Remembered it? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <ResetPasswordForm email={email} />
    </AuthCard>
  );
}