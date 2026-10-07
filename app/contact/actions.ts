"use server";

import { requireProfile } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation/auth";
import { contactSchema } from "@/lib/validation/contact";

export type ContactFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
} | null;

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const { profile } = await requireProfile();

  const parsed = contactSchema.safeParse({
    category: formData.get("category"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    await db.insert(contactMessages).values({
      profileId: profile.id,
      category: parsed.data.category,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
  } catch (err) {
    console.error("[contact] submit failed:", err);
    return { error: "We couldn't send your message. Please try again." };
  }

  return {};
}