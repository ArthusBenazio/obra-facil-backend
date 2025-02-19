import { z } from "zod";

export const equipmentSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
});

export const equipmentResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  user_id: z.string().optional().nullable(),
  company_id: z.string().optional().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});