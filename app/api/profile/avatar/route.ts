import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/guards";
import {
  MAX_AVATAR_BYTES,
  avatarPublicUrl,
  deleteAvatarObject,
  extensionForMime,
  putAvatarObject,
} from "@/lib/avatar";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);
  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found." },
      { status: 404 }
    );
  }

  const form = await request.formData();
  const file = form.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No image was provided." },
      { status: 400 }
    );
  }

  const ext = extensionForMime(file.type);
  if (!ext) {
    return NextResponse.json(
      {
        error:
          "Unsupported image type. Use a PNG, JPG, WebP, GIF, or AVIF file.",
      },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "The image appears to be empty." },
      { status: 400 }
    );
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json(
      { error: "The image must be smaller than 5 MB." },
      { status: 400 }
    );
  }

  let key: string;
  try {
    key = await putAvatarObject(
      session.user.id,
      ext,
      new Uint8Array(await file.arrayBuffer()),
      file.type
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("magic bytes")) {
      return NextResponse.json(
        { error: "The file content does not match its type. Please upload a valid image." },
        { status: 400 }
      );
    }
    throw err;
  }

  const previousKey = profile.avatarKey;
  await db
    .update(profiles)
    .set({ avatarKey: key })
    .where(eq(profiles.id, profile.id));

  if (previousKey) {
    await deleteAvatarObject(previousKey);
  }

  return NextResponse.json({
    avatarUrl: avatarPublicUrl(key),
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);
  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found." },
      { status: 404 }
    );
  }

  if (profile.avatarKey) {
    await deleteAvatarObject(profile.avatarKey);
    await db
      .update(profiles)
      .set({ avatarKey: null })
      .where(eq(profiles.id, profile.id));
  }

  return new NextResponse(null, { status: 204 });
}