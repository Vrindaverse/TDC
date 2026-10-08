import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  label,
  title,
  description,
  children,
  footer,
}: {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 md:py-14">
      <div className="tdc-frame overflow-hidden rounded-md border bg-card p-6 font-mono md:p-8">
        <p className="tdc-mono-label">tdc / {label}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {footer}
        </p>
      ) : null}
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
    >
      {children}
    </Link>
  );
}
