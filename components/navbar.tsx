"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks, site } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { MobileStaggeredMenu } from "@/components/mobile-staggered-menu";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
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

export function Navbar() {
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
          <MobileStaggeredMenu />
        </div>
      </div>
    </header>
  );
}