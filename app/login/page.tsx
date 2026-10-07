import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { resolvePostLoginRedirect, getSession } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Sign in",
};

async function SignedInRedirect() {
  const session = await getSession();
  if (session?.user) {
    redirect(await resolvePostLoginRedirect());
  }
  return null;
}

export default function LoginPage() {
  return (
    <AuthCard
      label="login"
      title="Welcome back"
      description="Sign in to join events, manage your registrations and see the community."
      footer={
        <>
          New to TDC? <AuthLink href="/register">Create an account</AuthLink>
        </>
      }
    >
      <Suspense>
        <SignedInRedirect />
      </Suspense>
      <LoginForm />
    </AuthCard>
  );
}