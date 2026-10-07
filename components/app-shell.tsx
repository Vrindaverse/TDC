import Link from "next/link";
import { headers } from "next/headers";

import { AdminNavbar } from "@/components/admin/admin-navbar";
import { Footer } from "@/components/footer";
import { MemberNavbar } from "@/components/member-navbar";
import { Navbar } from "@/components/navbar";
import { avatarPublicUrl } from "@/lib/avatar";
import {
  getProfile,
  getSession,
  getUnreadMessageCount,
} from "@/lib/auth/guards";
import { site } from "@/lib/navigation";

const ADMIN_PATHS = ["/admin"];

function isAdminArea(pathname: string) {
  return ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

async function readRequestArea() {
  const headerList = await headers();
  return isAdminArea(headerList.get("x-pathname") ?? "");
}

export async function AppChrome() {
  const [session, inAdminArea] = await Promise.all([
    getSession(),
    readRequestArea(),
  ]);
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const isAdmin = profile?.role === "ADMIN";
  const avatarUrl = profile?.avatarKey
    ? avatarPublicUrl(profile.avatarKey)
    : null;

  let unreadMessages = 0;
  if (isAdmin && inAdminArea) {
    unreadMessages = await getUnreadMessageCount();
  }

  if (isAdmin && inAdminArea) {
    return (
      <AdminNavbar
        avatarUrl={avatarUrl}
        userName={profile?.name}
        userEmail={session?.user?.email}
        unreadMessages={unreadMessages}
      />
    );
  }

  if (session?.user && profile && !isAdmin) {
    return (
      <MemberNavbar
        avatarUrl={avatarUrl}
        userName={profile.name}
        userEmail={session.user.email}
      />
    );
  }

  return (
    <Navbar
      isAuthenticated={Boolean(session?.user)}
      isAdmin={isAdmin}
      avatarUrl={avatarUrl}
      userName={profile?.name}
      userEmail={session?.user?.email}
    />
  );
}

export async function AppFooter() {
  const inAdminArea = await readRequestArea();
  if (inAdminArea) return null;
  return <Footer />;
}

export function ChromeSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-[6px] bg-primary text-[0.7rem] font-bold tracking-tight text-primary-foreground"
          >
            TD
          </span>
          <span className="text-base">{site.name}</span>
        </Link>
      </div>
    </header>
  );
}