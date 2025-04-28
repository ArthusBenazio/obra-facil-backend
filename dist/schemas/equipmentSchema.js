import { z } from "zod";
export const equipmentSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    company_id: z.string(),
});
export const equipmentResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    company_id: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
});
