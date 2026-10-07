"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function AdminTabs({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();

  const TABS: {
    label: string;
    href: string;
    badge?: number;
  }[] = [
    { label: "Overview", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Events", href: "/admin/events" },
    { label: "Registrations", href: "/admin/registrations" },
    { label: "Messages", href: "/admin/messages", badge: unreadMessages },
  ];

  return (
    <nav
      aria-label="Admin sections"
      className="flex flex-wrap gap-1 border-b"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.badge ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground tabular-nums">
                {tab.badge}
              </span>
            ) : null}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
