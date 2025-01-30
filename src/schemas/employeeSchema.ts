import { z } from "zod";

export const registerEmployeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(11, "Telefone deve constar DDD e ter no mínimo 11 caracteres"),
  cpf: z.string(),
  pix_key: z.string(),
  role: z.string().min(3, "Cargo deve ter pelo menos 3 caracteres"),
  daily_rate: z.number(),
  status: z.enum(["ativo", "inativo"]),
});


  export const employeeResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    cpf: z.string(),
    pix_key: z.string(),
    role: z.string(),
    daily_rate: z.number(),
    status: z.enum(["ativo", "inativo"]),
    user_id: z.string().optional(),
    company_id: z.string().nullable().optional(),
    created_at: z.date(),
    updated_at: z.date(),
  });