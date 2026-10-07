"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { ADMIN_NAV_ITEMS, VISIT_SITE_HREF } from "@/components/admin/admin-nav-items";
import { cn } from "@/lib/utils";

export function AdminSidebar({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();

  return (
    <aside className="shrink-0">
      <nav
        aria-label="Admin sections"
        className="sticky top-24 flex flex-col gap-1 rounded-xl border bg-card/60 p-2"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.label === "Messages" && unreadMessages > 0 ? (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {unreadMessages}
                </span>
              ) : null}
            </Link>
          );
        })}

        <div className="my-1 h-px bg-border" />

        <Link
          href={VISIT_SITE_HREF}
          target="_blank"
          className="group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          <span className="flex-1">Visit site</span>
        </Link>
      </nav>
    </aside>
  );
}