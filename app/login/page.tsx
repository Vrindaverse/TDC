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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

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
      {reset ? (
        <div
          role="status"
          className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
        >
          Password updated. Sign in with your new password.
        </div>
      ) : null}
      <LoginForm />
    </AuthCard>
  );
}