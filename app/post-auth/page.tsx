import { redirect } from "next/navigation";

import { resolvePostLoginRedirect } from "@/lib/auth/guards";

export const instant = false;

export default async function PostAuthPage() {
  redirect(await resolvePostLoginRedirect());
}