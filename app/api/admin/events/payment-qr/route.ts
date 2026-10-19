import { NextRequest, NextResponse } from "next/server";

import { getProfile } from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";
import {
  MAX_AVATAR_BYTES,
  avatarPublicUrl,
  extensionForMime,
  putPaymentQrObject,
} from "@/lib/avatar";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const profile = await getProfile(session.data.user.id);
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("paymentQr");

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

  try {
    const key = await putPaymentQrObject(
      ext,
      new Uint8Array(await file.arrayBuffer()),
      file.type
    );
    return NextResponse.json({ paymentQr: key, paymentQrUrl: avatarPublicUrl(key) });
  } catch (err) {
    console.error("[admin/events] payment QR upload failed:", err);
    return NextResponse.json(
      { error: "The upload failed. Please try again." },
      { status: 500 }
    );
  }
}
