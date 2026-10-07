import Link from "next/link";
import { Clock3, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PendingApprovalScreen() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Clock3 aria-hidden="true" className="size-7 text-primary" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">
        Membership pending approval
      </h1>
      <p className="text-sm text-muted-foreground">
        Thanks for registering! An admin reviews every new member before they
        get access to the member portal. You&apos;ll be able to use all member
        features as soon as your request is approved.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}

export function RejectedApprovalScreen() {
  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX aria-hidden="true" className="size-7 text-destructive" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">
        Membership request not approved
      </h1>
      <p className="text-sm text-muted-foreground">
        You can&apos;t be a member because your approval request was rejected.
        If you believe this is a mistake, contact the TDC team.
      </p>
      <Button asChild variant="outline">
        <Link href="/contact">Contact us</Link>
      </Button>
    </div>
  );
}
