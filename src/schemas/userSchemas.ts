import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido").min(9),
    phone: z
      .string()
      .min(11, "Telefone deve constar DDD e ter no mínimo 11 caracteres"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    subscriptionPlan: z.enum(["free", "basic", "premium"]),
    role: z.enum(["admin", "team", "client"]),
    userType: z.enum(["person", "business"]),
    cpf: z.string(),
    companyName: z.string().optional(),
    cnpj: z.string().optional(),
    positionCompany: z.string().optional(),
  })
  .refine(
    (data) =>
      data.userType === "business"
        ? !!data.companyName && !!data.cnpj && !!data.positionCompany
        : true,
    {
      message:
        'Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo "business".',
      path: ["userType"],
    }
  );

export const registerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  subscriptionPlan: z.string(),
  role: z.string(),
  userType: z.string(),
  company: z
    .object({
      companyName: z.string(),
      cnpj: z.string(),
      positionCompany: z.string(),
    })
    .optional(),
});

export const userResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    subscriptionPlan: z.string(),
    role: z.string(),
    userType: z.enum(['person', 'business']),
    cpf: z.string(),
    companyName: z.string().optional(),
    cnpj: z.string().optional(),
    positionCompany: z.string().optional(),
    company: z
      .object({
        id: z.string(),
        user_id: z.string(),
        company_name: z.string(),
        cnpj: z.string(),
        position_company: z.string(),
        created_at: z.date(),
        updated_at: z.date(),
      })
      .optional()
  })
  .refine(
    (data) => {
      if (data.userType === 'business') {
        return (
          (data.company && data.company.company_name && data.company.cnpj && data.company.position_company) ||
          false
        );
      }
      return true;
    },
    {
      message: 'Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo "business".',
      path: ['userType'],
    }
  );



