import { z } from "zod";

export const registrationStatuses = ["open", "closing", "closed"] as const;
export type RegistrationStatusValue = (typeof registrationStatuses)[number];

const BUNDLED_POSTER_PATTERN = /^\/images\/events\/[a-z0-9._-]+$/i;
const UPLOADED_POSTER_PATTERN = /^events\/[0-9a-f-]+\.[a-z0-9]+$/i;
const UPLOADED_PAYMENT_QR_PATTERN = /^events\/qr-[0-9a-f-]+\.[a-z0-9]+$/i;

export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title is too short")
      .max(120, "Title is too long"),
    description: z.string().trim().max(2000, "Description is too long"),
    location: z.string().trim().max(200, "Location is too long"),
    poster: z
      .string()
      .trim()
      .max(300, "Poster path is too long")
      .refine(
        (value) =>
          value === "" ||
          BUNDLED_POSTER_PATTERN.test(value) ||
          UPLOADED_POSTER_PATTERN.test(value),
        "Pick a preset poster or upload an image"
      ),
    fee: z
      .string()
      .trim()
      .max(10, "Fee is too long")
      .refine(
        (value) => value === "" || /^\d{1,6}$/.test(value),
        "Enter the fee as a whole number in rupees, or leave it empty for a free event"
      ),
    paymentQr: z
      .string()
      .trim()
      .max(300, "Payment QR path is too long")
      .refine(
        (value) => value === "" || UPLOADED_PAYMENT_QR_PATTERN.test(value),
        "Upload a payment QR image"
      ),
    domain: z
      .string()
      .trim()
      .min(1, "Pick a domain")
      .max(60, "Domain is too long"),
    registrationStatus: z.enum(registrationStatuses),
    startsAt: z
      .string()
      .trim()
      .min(1, "Pick a start date and time")
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Pick a valid start date and time"
      ),
    endsAt: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    const fee = values.fee ? Number(values.fee) : 0;
    if (fee > 0 && !values.paymentQr) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentQr"],
        message: "Upload the payment QR code for this fee",
      });
    }
    if (!values.endsAt) return;
    if (Number.isNaN(Date.parse(values.endsAt))) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Pick a valid end date and time",
      });
      return;
    }
    if (Date.parse(values.endsAt) <= Date.parse(values.startsAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End time must be after the start time",
      });
    }
  })
  .transform((values) => ({
    title: values.title,
    description: values.description || null,
    location: values.location || null,
    poster: values.poster || null,
    fee: values.fee ? Number(values.fee) : null,
    paymentQrKey: values.paymentQr || null,
    domain: values.domain,
    registrationStatus: values.registrationStatus,
    startsAt: new Date(values.startsAt),
    endsAt: values.endsAt ? new Date(values.endsAt) : null,
  }));

export type EventInput = z.input<typeof eventSchema>;
