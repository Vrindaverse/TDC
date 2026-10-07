"use client";

import { Trash2 } from "lucide-react";

import { deleteEventAction } from "@/app/admin/events/actions";
import { Button } from "@/components/ui/button";

export function DeleteEventButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form
      action={deleteEventAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete "${title}"? This also removes its registrations.`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        Delete
      </Button>
    </form>
  );
}
