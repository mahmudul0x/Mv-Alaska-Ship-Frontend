import { z } from "zod";

export const bookingContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  requests: z.string().optional(),
});

export type BookingContactValues = z.infer<typeof bookingContactSchema>;
