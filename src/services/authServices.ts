import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { User } from "../entities/user";
import { BadRequestError } from "../helpers/api-erros";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const authService = {
  async loginUser(body: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { companies: true },
    });

    if (!user) {
      throw new BadRequestError("E-mail ou senha inválidos.");
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new BadRequestError("E-mail ou senha inválidos.");
    }

    if (user.user_type === "business" || user.user_type === "person") {
      const companyId =
        user.companies && user.companies.length > 0
          ? user.companies[0]?.id
          : null;
      return new User(
        user.id,
        user.name,
        user.phone,
        user.email,
        user.password_hash,
        user.cpf,
        user.subscription_plan,
        user.role,
        user.user_type,
        companyId
      );
    } else {
      throw new BadRequestError("Tipo de usuário inválido ou não encontrado.");
    }
  },

  generateToken(user: User, server: FastifyInstance) {
    const token = server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        companyId: user.companyId || null,
        subscriptionPlan: user.subscriptionPlan,
        role: user.role,
      },
      { expiresIn: "1h" }
    );
    return token;
  },
};
