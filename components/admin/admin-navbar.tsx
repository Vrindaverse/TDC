"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { useState } from "react";

import { AccountMenu } from "@/components/account-menu";
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { VISIT_SITE_HREF } from "@/components/admin/admin-nav-items";

export function AdminNavbar({
  avatarUrl,
  userName,
  userEmail,
  unreadMessages = 0,
}: {
  avatarUrl?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  unreadMessages?: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2 sm:px-6">
      <AdminMobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        unreadMessages={unreadMessages}
      />
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-[4px] border border-border/60 bg-card/80 px-4 shadow-lg shadow-black/5 backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-[4px] border border-border bg-background text-sm font-bold text-primary shadow-sm"
          >
            $
          </span>
          <div className="flex flex-col leading-tight">
            <span className="tdc-mono text-base font-semibold tracking-tight">
              TDC Admin
            </span>
            <span className="tdc-mono-label text-[10px]">~/admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={VISIT_SITE_HREF}
            target="_blank"
            className="tdc-mono hidden items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground sm:inline-flex cursor-target"
          >
            <ExternalLink aria-hidden="true" className="size-3.5" />
            visit site
          </Link>
          <AccountMenu
            avatarUrl={avatarUrl}
            userName={userName}
            userEmail={userEmail}
            dashboardHref="/admin"
            active
          />
        </div>
      </div>
    </header>
  );
}