"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function AvatarUpload({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Upload failed. Please try again.");
        return;
      }
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!res.ok) {
        setError("Could not remove your profile picture.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not remove your profile picture.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative inline-flex">
        <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span aria-hidden="true" className="text-xl font-semibold">
              {initials}
            </span>
          )}
        </div>

        <label
          aria-label="Upload a profile picture"
          title="Upload a profile picture"
          className={cn(
            "absolute -bottom-1 -right-1 flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
            busy && "pointer-events-none opacity-60"
          )}
        >
          {busy ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Camera aria-hidden="true" className="size-4" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>

        {avatarUrl && !busy ? (
          <button
            type="button"
            aria-label="Remove profile picture"
            title="Remove profile picture"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-colors hover:bg-destructive/90"
          >
            <Trash2 aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}