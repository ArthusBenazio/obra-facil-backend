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

interface UserWithRelations extends User {
  companyUsers?: { company_id: string }[];
  projectsAssigned?: { id: string }[];
  projectAdmins?: { project_id: string }[];
}

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

  generateToken(user: UserWithRelations, server: FastifyInstance) {
    const token = server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        companyIds: user.companyUsers?.map((cu) => cu.company_id),
        subscriptionPlan: user.subscriptionPlan,
        role: user.role,
        assignedProjects: user.projectsAssigned?.map((p) => p.id),
        projectAdmin: user.projectAdmins?.map((pa) => pa.project_id),
      },
      { expiresIn: "24h" }
    );
    return token;
  },
};
