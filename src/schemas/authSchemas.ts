import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(6, "E-mail é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    userType: z.enum(["person", "business"]),
    cpf: z.string(),
    companies: z.array(z.object({
      id: z.string(),
      companyName: z.string(),
      positionCompany: z.string().optional(),
      cnpj: z.string().optional(),
      subscriptionPlan: z.string(),
      role: z.string(),
    })),
  }),
});