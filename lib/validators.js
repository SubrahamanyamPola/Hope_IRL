import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Min 8 characters"),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal(""))
});

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(6, "Phone is required"),
  linkedinUrl: z.string().url().optional().or(z.literal(""))
});

export const paymentSchema = z.object({
  paymentRef: z.string().min(3, "Payment reference is required")
});
