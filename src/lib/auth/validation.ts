import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(255, "Email must be 255 characters or less")
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .max(255, "Password must be 255 characters or less");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required")
  .max(120, "Display name must be 120 characters or less");

export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type DisplayNameInput = z.infer<typeof displayNameSchema>;
