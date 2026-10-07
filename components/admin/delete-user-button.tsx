"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteUserAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({
  userId,
  self,
}: {
  userId: string;
  self: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (self) return null;

  return (
    <form action={deleteUserAction}>
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="submit"
        variant={confirming ? "destructive" : "outline"}
        size="sm"
        aria-label={confirming ? "Confirm deleting this user" : "Delete user"}
        onClick={(event) => {
          if (!confirming) {
            event.preventDefault();
            setConfirming(true);
            setTimeout(() => setConfirming(false), 4000);
          }
        }}
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
        {confirming ? "Confirm delete" : "Delete"}
      </Button>
    </form>
  );
}