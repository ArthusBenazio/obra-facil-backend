import { z } from "zod";

export const registerEmployeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(11, "Telefone deve ter pelo menos 11 caracteres"),
  role: z.string().min(3, "Cargo deve ter pelo menos 3 caracteres"),
  daily_rate: z.number(),
  status: z.enum(["ativo", "inativo"]),
  cpf: z.string().min(11, "CPF deve ter pelo menos 11 caracteres"),
  pix_key: z.string().min(11, "Chave PIX deve ter pelo menos 11 caracteres"),
  company_id: z.string(),
});

export const employeeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  role: z.string(),
  daily_rate: z.number(),
  status: z.enum(["ativo", "inativo"]),
  cpf: z.string(),
  pix_key: z.string(),
  company_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const deleteEmployeeResponseSchema = z.object({
  message: z.string(),
});

export const reportHoursWorkedResponseSchema = z.array(
  z.object({
    name: z.string(),
    daily_rate: z.number(),
    work_days: z.array(
      z.object({
        hours_worked: z.number(),
        created_at: z.date(),
      })
    ),
  })
);

export const querystring = z.object({
  company_id: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
