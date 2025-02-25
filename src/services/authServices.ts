import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { BadRequestError } from "../helpers/api-erros";
import { loginSchema } from "../schemas/authSchemas";
import { CompanyInfo } from "../types/companyInfo";
import { authResponse } from "../types/authTypes";

export const authService = {
  async loginUser(body: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: {
        company_user: {
          include: {
            company: true,
          },
        },
      },
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

    const companies: CompanyInfo[] = user.company_user.map((cu) => ({
      id: cu.company_id,
      role: cu.role,
      subscriptionPlan: cu.company.subscription_plan,
      companyName: cu.company.company_name,
      cnpj: cu.company.cnpj ?? '',
      positionCompany: cu.company.position_company ?? '',
    }));

    return {
      ...user,
      companies,
    };
  },

  generateToken(user: authResponse, server: FastifyInstance) {
    const companyIds = Array.isArray(user.companies)
      ? user.companies.map((c) => c.id)
      : [];
    const roles = Array.isArray(user.companies)
      ? user.companies.map((c) => c.role)
      : [];

    const token = server.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        companyIds,
        roles,
      },
      { expiresIn: "24h" }
    );
    return token;
  },
};
