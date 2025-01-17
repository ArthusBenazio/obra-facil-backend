import { isValid, parse } from "date-fns";
import { z } from "zod";

const validateBrazilianDate = (date: string) => {
  const parsedDate = parse(date, "dd/MM/yyyy", new Date());
  return isValid(parsedDate);
};

export const projectSchema = z.object({
  name: z.string().nonempty("O nome da obra é obrigatório."),
  description: z.string().nonempty("A descrição da obra é obrigatória."),
  responsible: z.string().nonempty("O responsável pela obra é obrigatório."),
  engineer: z.string().optional(),
  crea_number: z.string().optional(),
  start_date: z
    .string()
    .nonempty("A data de início é obrigatória.")
    .refine(validateBrazilianDate, {
      message: "A data de início deve ser válida.",
    }),
  expected_end_date: z
    .string()
    .nonempty("A previsão de término é obrigatória.")
    .refine(validateBrazilianDate, {
      message: "A previsão de término deve ser válida.",
    }),
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
  created_by_user_id: z.string(),
  company_id: z.string().optional().nullable(),
  client: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;
