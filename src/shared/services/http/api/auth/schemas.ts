import { z } from "zod";

export const userResponseSchema = z.object({
  id: z
    .string()
    .or(z.number())
    .transform((val) => String(val)),
  name: z.string(),
  email: z.email(),
  email_verified_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const loginResponseSchema = z.object({
  user: userResponseSchema,
  token: z.string(),
});
