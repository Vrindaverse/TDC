"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, X } from "lucide-react";

import { ADMIN_NAV_ITEMS, VISIT_SITE_HREF } from "@/components/admin/admin-nav-items";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AdminMobileSidebar({
  open,
  onOpenChange,
  unreadMessages = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unreadMessages?: number;
}) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-72 flex-col p-0 sm:max-w-sm">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-4">
          <SheetTitle asChild>
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-[6px] bg-primary text-[0.7rem] font-bold tracking-tight text-primary-foreground"
              >
                TD
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-base font-semibold tracking-tight">
                  TDC Admin
                </span>
                <span className="tdc-mono-label text-[10px]">console</span>
              </span>
            </span>
          </SheetTitle>
          <SheetClose className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-col gap-1 overflow-y-auto p-3">
          <span className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </span>
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
                onClick={() => onOpenChange(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0",
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.label === "Messages" && unreadMessages > 0 ? (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums shadow-sm",
                      active
                        ? "bg-primary-foreground/25 text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {unreadMessages}
                  </span>
                ) : null}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/30"
                  />
                ) : null}
              </Link>
            );
          })}

          <div className="my-2 h-px bg-border/60" />

          <Link
            href={VISIT_SITE_HREF}
            target="_blank"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            <span className="flex-1">Visit site</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}