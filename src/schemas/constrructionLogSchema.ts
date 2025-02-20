import { Climate, Condition, Period } from "@prisma/client";
import { isValid, parse } from "date-fns";
import { date, z } from "zod";

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
  tasks: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  weathers: z
    .array(
      z.object({
        period: z.nativeEnum(Period),
        climate: z.nativeEnum(Climate),
        condition: z.nativeEnum(Condition),
      })
    )
    .nonempty("Pelo menos um clima deve ser registrado"),
  occurrences: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      employee_id: z.string().uuid().optional().nullable(),
    })
  ).optional(),
  services: z.array(
    z.object({
      name: z.string().nonempty("O nome do serviço é obrigatório."),
      description: z.string().min(3, "A descrição do serviço é obrigatória."),
      value: z.number(),
    })
  ).optional(),
  employees: z.array(
    z.object({
      hours_worked: z.number(),
      employee_id: z.string().uuid(),
    })
  ),
  equipment_usage: z.array(
    z.object({
      equipment_id: z.string().uuid(),
      quantity: z.number(),
    })
  ).optional(),
});

export const constructionLogResponseSchema = constructionLogSchema.extend({
  id: z.string(),
  date: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const updateLogSchema = constructionLogSchema.partial();
