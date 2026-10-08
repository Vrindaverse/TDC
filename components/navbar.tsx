"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";

import { MobileStaggeredMenu } from "@/components/mobile-staggered-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";
import { navLinks, site } from "@/lib/navigation";
import { cn } from "@/lib/utils";

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

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight text-foreground",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-[6px] bg-primary text-[0.7rem] font-bold tracking-tight text-primary-foreground"
      >
        TD
      </span>
      <span className="text-base">{site.name}</span>
    </Link>
  );
}

export function Navbar({
  isAuthenticated,
  isAdmin,
  avatarUrl,
  userName,
  userEmail,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  avatarUrl?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-1 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    title={userName || "Account"}
                    className={cn(
                      "group flex items-center gap-1.5 rounded-full p-0.5 outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring",
                      isActive(pathname, "/profile") &&
                        "ring-2 ring-ring ring-offset-2 ring-offset-background"
                    )}
                  >
                    <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : avatarInitials(userName, userEmail) ? (
                        <span
                          aria-hidden="true"
                          className="flex size-full items-center justify-center bg-primary text-xs font-semibold text-primary-foreground"
                        >
                          {avatarInitials(userName, userEmail)}
                        </span>
                      ) : (
                        <User
                          aria-hidden="true"
                          className="size-5 text-muted-foreground"
                        />
                      )}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  className="w-60"
                >
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
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <LayoutDashboard aria-hidden="true" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="w-full p-0"
                    onSelect={(event) => event.preventDefault()}
                  >
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
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors",
                    isActive(pathname, "/login")
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <MobileStaggeredMenu
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </header>
  );
}
