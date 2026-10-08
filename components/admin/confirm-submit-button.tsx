"use client";

import { CsrfInput } from "@/components/csrf-input";
import type { VariantProps } from "class-variance-authority";
import { useState, type ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Submit button that requires a second click before firing its form action —
 * the shared guard for destructive admin operations.
 */
export function ConfirmSubmitButton({
  action,
  fields = {},
  label,
  confirmLabel = "Confirm",
  variant = "outline",
  size = "sm",
  className,
  ariaLabel,
  icon,
  iconOnly = false,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
  label: ReactNode;
  confirmLabel?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={action}>
      <CsrfInput />
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="submit"
        variant={confirming ? "destructive" : variant}
        size={size}
        className={className}
        aria-label={confirming ? confirmLabel : ariaLabel}
        onClick={(event) => {
          if (!confirming) {
            event.preventDefault();
            setConfirming(true);
            setTimeout(() => setConfirming(false), 4000);
          }
        }}
      >
        {icon ?? null}
        {iconOnly ? (
          <span className="sr-only">{confirming ? confirmLabel : label}</span>
        ) : (
          (confirming ? confirmLabel : label)
        )}
      </Button>
    </form>
  );
}
