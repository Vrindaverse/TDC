import { z } from "zod";

export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const registerSchema = z
  .object({
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
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").max(254, "Email is too long"),
  password: z.string().min(1, "Enter your password"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const completeProfileSchema = z.object({
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
});

export type RegisterInput = z.input<typeof registerSchema>;
export type CompleteProfileInput = z.input<typeof completeProfileSchema>;

export type FieldErrors = Record<string, string>;

export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
