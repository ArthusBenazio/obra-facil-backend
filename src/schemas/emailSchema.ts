import { z } from "zod";

export const emailSchema = z.object({
  to: z.string().email("E-mail inválido"),
  subject: z.string().min(1, "O assunto é obrigatório"),
  html: z.string().min(1, "O conteúdo HTML é obrigatório"),
});