"use client";

import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";

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

function avatarInitials(name?: string | null, email?: string | null) {
  const source = (name?.trim() || email?.split("@")[0] || "").trim();
  if (!source) return null;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Shell-command prompt shown on the focused dropdown item. */
function ItemCaret() {
  return (
    <span
      aria-hidden="true"
      className="-ml-1 inline-flex size-3.5 shrink-0 translate-x-1 items-center justify-center text-primary opacity-0 transition-all duration-150 group-data-[highlighted]:translate-x-0 group-data-[highlighted]:opacity-100"
    >
      ❯
    </span>
  );
}

/**
 * Auth-aware account dropdown shared by every navbar. Squares-up the avatar to
 * match the terminal theme and renders a faux-shell menu (`~/account` header,
 * dashed separators, `❯` prompt on focus).
 */
export function AccountMenu({
  avatarUrl,
  userName,
  userEmail,
  dashboardHref,
  dashboardLabel = "Admin dashboard",
  active = false,
}: {
  avatarUrl?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  /** When set, an extra "dashboard" item is shown (admins only). */
  dashboardHref?: string;
  dashboardLabel?: string;
  /** Highlights the trigger while the user is on their profile. */
  active?: boolean;
}) {
  const initials = avatarInitials(userName, userEmail);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          title={userName || userEmail || "Account"}
          className={cn(
            "group flex items-center gap-1.5 rounded-[4px] p-0.5 outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring",
            active && "ring-2 ring-ring ring-offset-2 ring-offset-background"
          )}
        >
          <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-[4px] border border-border bg-muted">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : initials ? (
              <span
                aria-hidden="true"
                className="tdc-mono flex size-full items-center justify-center bg-primary text-[0.65rem] font-semibold tracking-wide text-primary-foreground"
              >
                {initials}
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
      <DropdownMenuContent side="bottom" align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="tdc-mono-label">~/account</span>
          <span className="truncate text-sm font-semibold">
            {userName || "Member"}
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
            <ItemCaret />
            <User aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        {dashboardHref ? (
          <DropdownMenuItem asChild>
            <Link href={dashboardHref}>
              <ItemCaret />
              <LayoutDashboard aria-hidden="true" />
              {dashboardLabel}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="w-full p-0"
          onSelect={(event) => event.preventDefault()}
        >
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-xs font-medium text-inherit"
            >
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}