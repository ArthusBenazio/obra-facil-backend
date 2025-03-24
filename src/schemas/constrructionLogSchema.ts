import { Climate, Condition, Period } from "@prisma/client";
import { date, z } from "zod";

const dateSchema = z
  .union([z.string(), z.date()])
  .transform((val) => (typeof val === "string" ? new Date(val) : val));

export const constructionLogSchema = z.object({
  date: dateSchema,
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
  occurrences: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
        employee_id: z.string().uuid().optional().nullable(),
      })
    )
    .optional(),
  services: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        value: z.number(),
      })
    )
    .optional(),
  employees: z.array(
    z.object({
      hours_worked: z.number(),
      employee_id: z.string().uuid(),
    })
  ),
  equipment_usage: z
    .array(
      z.object({
        equipment_id: z.string().uuid(),
        quantity: z.number(),
      })
    )
    .optional(),
});

export const constructionLogResponseSchema = constructionLogSchema.extend({
  id: z.string(),
  date: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
  employees: z.array(
    z.object({
      hours_worked: z.number(),
      employee_id: z.string().uuid(),
      employee: z.object({ name: z.string() }),
    })
  ),
  equipment_usage: z
    .array(
      z.object({
        equipment_id: z.string().uuid(),
        quantity: z.number(),
        equipment: z.object({ name: z.string() }),
      })
    )
    .optional(),
});

export const updateLogSchema = constructionLogSchema.partial();

export const getConstructionLogQuerySchema = z.object({
  project_id: z.string(),
  date: z.string().optional(),
});

export const getConstructionLogByIdQuerySchema = z.object({
  date: z.string().optional(),
});
