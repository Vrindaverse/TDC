import { z } from "zod";

export const contactCategories = [
  "general",
  "membership",
  "event",
  "collaboration",
  "support",
  "feedback",
  "other",
] as const;
export type ContactCategoryValue = (typeof contactCategories)[number];

export const contactCategoryLabels: Record<ContactCategoryValue, string> = {
  general: "General enquiry",
  membership: "Membership & joining",
  event: "Event question",
  collaboration: "Collaboration / partnership",
  support: "Support",
  feedback: "Feedback",
  other: "Something else",
};

export const contactSchema = z.object({
  category: z.enum(contactCategories),
  subject: z
    .string()
    .trim()
    .min(3, "Please add a short subject.")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(2000, "Message is too long"),
});