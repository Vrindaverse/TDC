import { z } from "zod";

export const collegeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "College name is too short")
    .max(120, "College name is too long"),
  code: z
    .string()
    .trim()
    .min(2, "Code is too short")
    .max(20, "Code is too long")
    .toUpperCase()
    .regex(
      /^[A-Z0-9][A-Z0-9-]*$/,
      "Use uppercase letters, numbers and hyphens"
    ),
});

export type CollegeInput = z.input<typeof collegeSchema>;
