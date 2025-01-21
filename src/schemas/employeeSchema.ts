import { z } from "zod";

export const registerEmployeeSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    role: z.string().min(3, "Cargo deve ter pelo menos 3 caracteres"),
    daily_rate: z.number(),
    status: z.enum(["ativo", "inativo"]),
    project_id: z.string(),
    user_id: z.string().optional(),
    company_id: z.string().optional(),
  })
  .refine(
    (data) => data.user_id || data.company_id,
    { message: "O funcionário deve estar associado a um usuário ou uma empresa" }
  );

  export const employeeResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    daily_rate: z.number(),
    status: z.enum(["ativo", "inativo"]),
    project_id: z.string(),
    user_id: z.string().optional(),
    company_id: z.string().optional(),
    created_at: z.date(),
    updated_at: z.date(),
  });