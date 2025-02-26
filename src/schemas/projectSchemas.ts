import { z } from "zod";

const dateSchema = z.union([z.string(), z.date()]).transform((val) =>
  typeof val === "string" ? new Date(val) : val
);

export const projectSchema = z.object({
  name: z.string().nonempty("O nome da obra é obrigatório."),
  description: z.string().nonempty("A descrição da obra é obrigatória."),
  responsible: z.string().nonempty("O responsável pela obra é obrigatório."),
  engineer: z.string().optional(),
  crea_number: z.string().optional(),
  start_date: dateSchema,
  expected_end_date: dateSchema,
  status: z.enum([
    "nao_iniciado",
    "iniciando",
    "em_andamento",
    "concluido",
    "cancelado",
    "em_espera",
  ]),
  address: z.string().nonempty("O endereço é obrigatório."),
  estimated_budget: z.number().optional(),
  client: z.string().nonempty("O cliente é obrigatório."),
  company_id: z.string(),
});

export const projectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  responsible: z.string(),
  engineer: z.string().optional(),
  crea_number: z.string().optional(),
  start_date: z.date(),
  expected_end_date: z.date(),
  status: z.enum([
    "nao_iniciado",
    "iniciando",
    "em_andamento",
    "concluido",
    "cancelado",
    "em_espera",
  ]),
  address: z.string(),
  estimated_budget: z.number().optional(),
  company_id: z.string(),
  assigned_user_id: z.string().optional().nullable(),
  client: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;
