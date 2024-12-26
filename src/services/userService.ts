import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { BadRequestError } from "../helpers/api-erros";
import { User } from "../entities/user";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido").min(9),
    phone: z.string().min(11, "Telefone deve constar DDD e ter no minímo 11 caracteres"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres"),
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

  export const usersService = {
    async registerUser(body: z.infer<typeof registerSchema>) {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });
  
      if (existingUser) {
        throw new BadRequestError("E-mail já registrado.");
      }
  
      const hashedPassword = await bcrypt.hash(body.password, 10);
  
      const userType = body.userType === "person" || body.userType === "business" ? body.userType : "person"; 

      const newUser = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          password_hash: hashedPassword,
          cpf: body.cpf,
          subscription_plan: body.subscriptionPlan,
          role: body.role,
          user_type: userType,
          companyName: body.userType === "business" ? body.companyName : undefined, 
          cnpj: body.userType === "business" ? body.cnpj : undefined, 
          positionCompany: body.userType === "business" ? body.positionCompany : undefined, 
        },
      });
  
      return new User(
        newUser.id,
        newUser.name,
        newUser.phone,
        newUser.email,
        newUser.password_hash,
        newUser.cpf,
        newUser.subscription_plan,
        newUser.role,
        newUser.user_type as "person" | "business",
        newUser.companyName ?? "",
        newUser.cnpj ?? "",
        newUser.positionCompany ?? ""
      );
    },
  
    async getAllUsers() {
      const users = await prisma.user.findMany();
      return users;
    },
};
