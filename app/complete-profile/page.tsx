import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import {
  getPendingContext,
  getProfile,
  getSession,
  hasVerifiedCookie,
} from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { colleges } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Complete your profile",
};

export const instant = false;

export default async function CompleteProfilePage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await getProfile(session.user.id);
  if (profile) {
    redirect("/post-auth");
  }

  if (!session.user.emailVerified && !(await hasVerifiedCookie())) {
    redirect("/verify");
  }

  const collegeRows = await db
    .select({
      id: colleges.id,
      name: colleges.name,
      code: colleges.code,
    })
    .from(colleges)
    .where(eq(colleges.isActive, true))
    .orderBy(asc(colleges.name));

  const context = await getPendingContext();
  const pending = context?.pending;

  return (
    <AuthCard
      label="complete profile"
      title="Tell us about you"
      description="Your name and email come from your account. Add your TDC details to finish setting up."
    >
      <CompleteProfileForm
        colleges={collegeRows}
        name={session.user.name || "TDC Member"}
        email={session.user.email}
        initialValues={{
          mobile: pending?.mobile ?? "",
          collegeId: pending?.collegeId ?? "",
          enrollmentNumber: pending?.enrollmentNumber ?? "",
        }}
      />
    </AuthCard>
  );
}
