import { z } from "zod";

import { MOBILE_PATTERN } from "./auth";

export const semesterOptions = Array.from({ length: 8 }, (_, index) => index + 1);

export const joinSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "Name is too long"),
  email: z.email("Enter a valid email address").max(254, "Email is too long"),
  mobile: z
    .string()
    .trim()
    .regex(MOBILE_PATTERN, "Enter a valid 10-digit mobile number"),
  enrollmentNumber: z
    .string()
    .trim()
    .min(3, "Enter your enrollment number")
    .max(30, "Enrollment number is too long")
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9/-]*$/,
      "Use only letters, numbers, - or /"
    ),
  semester: z.coerce
    .number({ message: "Choose your current semester" })
    .int()
    .min(1, "Choose your current semester")
    .max(8, "Choose a semester between 1 and 8"),
});

export const joinSemesterSchema = z.coerce
  .number({ message: "Choose your current semester" })
  .int()
  .min(1)
  .max(8);