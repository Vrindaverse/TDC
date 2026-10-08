"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { TerminalNavLink } from "@/components/ui/terminal-nav-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const MEMBER_LINKS = [
  { label: "Member Portal", href: "/profile" },
  { label: "Events", href: "/events" },
  { label: "Join", href: "/join" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function avatarInitials(name?: string | null, email?: string | null) {
  const source = (name?.trim() || email?.split("@")[0] || "").trim();
  if (!source) return null;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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

        <nav aria-label="Member" className="hidden items-center gap-1 md:flex">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                title={userName || "Account"}
                className="group flex items-center gap-1.5 rounded-full p-0.5 outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="size-full object-cover" />
                  ) : avatarInitials(userName, userEmail) ? (
                    <span
                      aria-hidden="true"
                      className="flex size-full items-center justify-center bg-primary text-xs font-semibold text-primary-foreground"
                    >
                      {avatarInitials(userName, userEmail)}
                    </span>
                  ) : (
                    <User aria-hidden="true" className="size-5 text-muted-foreground" />
                  )}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </button>
            </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" sideOffset={8} className="w-60">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="truncate text-sm font-semibold">
                {userName || "Account"}
              </span>
              {userEmail ? (
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {userEmail}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User aria-hidden="true" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" className="w-full p-0" onSelect={(event) => event.preventDefault()}>
              <form action={signOutAction} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium"
                >
                  <LogOut aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
