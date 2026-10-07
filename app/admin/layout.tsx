import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  getProfile,
  getSession,
  getUnreadMessageCount,
} from "@/lib/auth/guards";

export const instant = false;

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await getProfile(session.user.id);
  if (!profile) {
    redirect("/complete-profile");
  }

  if (profile.role !== "ADMIN") {
    return <Forbidden />;
  }

  const unreadMessages = await getUnreadMessageCount();

  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:py-10 lg:flex-row lg:gap-8 lg:px-8">
        <div className="hidden w-60 shrink-0 lg:block">
          <AdminSidebar unreadMessages={unreadMessages} />
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function Forbidden(): ReactNode {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
      <p className="tdc-mono-label">error 403</p>
      <h1 className="text-2xl font-semibold tracking-tight">Admins only</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        You don&apos;t have permission to open the admin console. If you think
        this is a mistake, contact a TDC administrator.
      </p>
    </div>
  );
}