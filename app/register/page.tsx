import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cacheLife } from "next/cache";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getSession, resolvePostLoginRedirect } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { colleges } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Create your account",
};

async function getActiveColleges() {
  "use cache";
  cacheLife("hours");

  return db
    .select({
      id: colleges.id,
      name: colleges.name,
      code: colleges.code,
    })
    .from(colleges)
    .where(eq(colleges.isActive, true))
    .orderBy(asc(colleges.name));
}

async function SignedInRedirect() {
  const session = await getSession();
  if (session?.user) {
    redirect(await resolvePostLoginRedirect());
  }
  return null;
}

export default async function RegisterPage() {
  const collegeRows = await getActiveColleges();

  return (
    <AuthCard
      label="register"
      title="Join TDC"
      description="Create your account to participate in events, workshops and community projects. We'll send a verification code to your email."
      footer={
        <>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <Suspense>
        <SignedInRedirect />
      </Suspense>
      <RegisterForm colleges={collegeRows} />
    </AuthCard>
  );
}