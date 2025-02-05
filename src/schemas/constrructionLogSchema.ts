import { Climate, Condition, Period } from "@prisma/client";
import { isValid, parse } from "date-fns";
import { z } from "zod";

const validateBrazilianDate = (date: string) => {
  const parsedDate = parse(date, "dd/MM/yyyy", new Date());
  return isValid(parsedDate);
};

export const constructionLogSchema = z.object({
  date: z
    .string()
    .nonempty("A data de início é obrigatória.")
    .refine(validateBrazilianDate, {
      message: "A data deve ser válida.",
    }),
  project_id: z.string(),
  tasks: z.string(),
  comments: z.string(),
  weathers: z.array(z.object({
    period: z.nativeEnum(Period),
    climate: z.nativeEnum(Climate),
    condition: z.nativeEnum(Condition),
  })).nonempty("Pelo menos um clima deve ser registrado"),
  occurrences: z.array(z.object({
    type: z.string(),
    description: z.string(),
    employee_id: z.string().uuid().optional(),
  })),
  services: z.array(z.object({
    name: z.string().nonempty("O nome do serviço é obrigatório."),
    description: z.string().min(3, "A descrição do serviço é obrigatória."),
    value: z.number(),
  })),
  employees: z.array(z.object({
    hours_worked: z.number(),
    employee_id: z.string().uuid(),
  }))
});

export const constructionLogResponseSchema = constructionLogSchema.extend({
  id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  date: z.date(),
  weathers: z.array(z.object({
    period: z.string(),
    climate: z.string(),
    condition: z.string(),
  })),
  occurrences: z.array(z.object({
    type: z.string(),
    description: z.string(),
    employee_id: z.string().nullable().optional(),
  })),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    value: z.number(),
  })),
  employees: z.array(z.object({
    hours_worked: z.number(),
    employee_id: z.string(),
  }))
});

export const updateLogSchema = constructionLogSchema.partial();
