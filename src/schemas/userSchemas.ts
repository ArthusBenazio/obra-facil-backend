import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido").min(9),
  phone: z
    .string()
    .min(11, "Telefone deve constar DDD e ter no mínimo 11 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  userType: z.enum(["person", "business"]),
  cpf: z.string(),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
  positionCompany: z.string().optional(),
  subscriptionPlan: z.enum(["free", "basic", "premium", "premium_plus"]).default("free"),
});

export const registerSchema = baseSchema.refine(
  (data) => {
    if (data.userType === "business") {
      return !!data.companyName && !!data.cnpj && !!data.positionCompany;
    }
    return true;
  },
  {
    message:
      'Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo "business".',
    path: ["userType"],
  }
);

export const updateSchema = baseSchema.partial().refine(
  (data) => {
    if (data.userType === "business") {
      return !!data.companyName && !!data.cnpj && !!data.positionCompany;
    }
    return true;
  },
  {
    message:
      'Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo "business".',
    path: ["userType"],
  }
);

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  userType: z.string(),
  cpf: z.string(),
  companies: z.array( 
    z.object({
      id: z.string(),
      companyName: z.string(),
      positionCompany: z.string().optional(),
      cnpj: z.string().optional(),
      subscriptionPlan: z.string(),
    })
  ),
});

export const registerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  userType: z.string(),
  cpf: z.string(),
  company: z.object({
    companyName: z.string(),
    cnpj: z.string().optional(),
    positionCompany: z.string().optional(),
    subscriptionPlan: z.string(),
  }),
});

export const addUserToCompanySchema = z.object({
  email: z.string().email("E-mail inválido"),
  companyId: z.string().uuid("ID da empresa inválido"),
  role: z.enum(["admin", "team", "client"]),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  phone: z.string().min(11, "Telefone deve ter no mínimo 11 caracteres").optional(),
  cpf: z.string().min(11, "CPF deve ter 11 caracteres").optional(),
  userType: z.enum(["person", "business"]).optional(),
});

export const addUserToCompanyResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    phone: z.string(),
    cpf: z.string(),
    userType: z.string(),
  }),
  company: z.object({
    id: z.string(),
    companyName: z.string(),
    cnpj: z.string().optional(),
    positionCompany: z.string().optional(),
    subscriptionPlan: z.string(),
  }),
  role: z.enum(["admin", "team", "client"]),
});
