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

    return new User(
      user.id,
      user.name,
      user.email,
      user.password_hash,
      user.subscription_plan,
      user.role
    );
  },

  generateToken(user: User, server: FastifyInstance) {
    const token = server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        role: user.role,
      },
      { expiresIn: "1h" }
    );
    return token;
  },
};
