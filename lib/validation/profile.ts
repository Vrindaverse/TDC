import { z } from "zod";

import { MOBILE_PATTERN } from "@/lib/validation/auth";

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "Name is too long"),
  mobile: z
    .string()
    .trim()
    .regex(MOBILE_PATTERN, "Enter a valid 10-digit mobile number"),
  collegeId: z.uuid("Select your college"),
  enrollmentNumber: z
    .string()
    .trim()
    .min(3, "Enter your enrollment number")
    .max(30, "Enrollment number is too long")
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9/-]*$/,
      "Use only letters, numbers, - or /"
    ),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  skills: z
    .string()
    .trim()
    .max(200, "Skills list is too long")
    .optional()
    .or(z.literal("")),
});

export const teamPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Give your post a short title (min 5 characters)")
    .max(120, "Title is too long"),
  body: z
    .string()
    .trim()
    .min(20, "Describe what you're looking for (min 20 characters)")
    .max(1000, "Post is too long"),
  eventId: z
    .string()
    .uuid("Select a valid event")
    .optional()
    .or(z.literal("")),
});
