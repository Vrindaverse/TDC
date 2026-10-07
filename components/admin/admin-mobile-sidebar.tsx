"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { ADMIN_NAV_ITEMS, VISIT_SITE_HREF } from "@/components/admin/admin-nav-items";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
      <SheetContent side="left" className="w-72 p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-4 py-4">
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
        </SheetHeader>

        <div className="flex flex-col gap-1 overflow-y-auto p-3">
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
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
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
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            <span className="flex-1">Visit site</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}