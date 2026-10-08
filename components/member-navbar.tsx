"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { TerminalNavLink } from "@/components/ui/terminal-nav-link";
import { cn } from "@/lib/utils";

const MEMBER_LINKS = [
  { label: "Member Hub", href: "/profile" },
  { label: "Forum", href: "/forum" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function MemberNavbar({
  avatarUrl,
  userName,
  userEmail,
}: {
  avatarUrl?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          >
            {mobileOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
          <Link
            href="/profile"
            className="tdc-mono flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
          >
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-[4px] border border-border bg-background text-sm font-bold text-primary shadow-sm"
            >
              $
            </span>
            <span className="flex flex-col leading-tight">
              <span className="tdc-mono text-base">TDC Member</span>
              <span className="tdc-mono-label text-[10px] text-muted-foreground">
                ~/member
              </span>
            </span>
          </Link>
        </div>

        <nav aria-label="Member" className="tdc-nav-enter hidden items-center gap-1 md:flex">
          {MEMBER_LINKS.map((link) => (
            <TerminalNavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={isActive(pathname, link.href)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu
            avatarUrl={avatarUrl}
            userName={userName}
            userEmail={userEmail}
            active={isActive(pathname, "/profile")}
          />
        </div>
      </div>

      {mobileOpen ? (
        <nav aria-label="Member mobile" className="border-t md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {MEMBER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "tdc-mono flex items-center gap-2 rounded-[3px] px-3 py-2.5 text-xs font-medium uppercase tracking-widest",
                  isActive(pathname, link.href)
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-primary",
                    isActive(pathname, link.href) ? "opacity-100" : "opacity-0"
                  )}
                >
                  ❯
                </span>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
