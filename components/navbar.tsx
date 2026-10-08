"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountMenu } from "@/components/account-menu";
import { MobileStaggeredMenu } from "@/components/mobile-staggered-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { TerminalNavLink } from "@/components/ui/terminal-nav-link";
import { navLinks, site } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "tdc-mono tdc-rise tdc-rise-1 group flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground cursor-target",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-[4px] border border-border bg-background text-sm font-bold text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
      >
        $
      </span>
      <span className="tdc-mono">{site.name}</span>
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
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="tdc-nav-enter hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
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
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <AccountMenu
                avatarUrl={avatarUrl}
                userName={userName}
                userEmail={userEmail}
                dashboardHref={isAdmin ? "/admin" : undefined}
                active={isActive(pathname, "/profile")}
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "tdc-mono group inline-flex h-8 items-center gap-1 rounded-[3px] px-3 text-xs font-medium uppercase tracking-widest transition-colors cursor-target",
                    isActive(pathname, "/login")
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-70"
                  >
                    ❯
                  </span>
                  login
                </Link>
                <Link
                  href="/register"
                  className="tdc-mono inline-flex h-8 items-center rounded-[3px] bg-primary px-3 text-xs font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 cursor-target"
                >
                  register
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
