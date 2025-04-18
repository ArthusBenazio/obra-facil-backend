import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { UserResponse } from "../types/userTypes";
import {
  addUserToCompanySchema,
  registerSchema,
  updateSchema,
} from "../schemas/userSchemas";
import { user_role } from "@prisma/client";
import { generateRandomPassword } from "../utils/generateRandomPassword";
import { sendEmail } from "./emailService";
import { emailTemplate } from "../utils/emailTemplate";
import {
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS,
  validatePassword,
} from "../utils/validators";

export const usersService = {
  async registerUser(body: z.infer<typeof registerSchema>) {
    if (!PASSWORD_REGEX.test(body.password)) {
      throw new BadRequestError(PASSWORD_REQUIREMENTS);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestError("E-mail já registrado.");
    }

    const existingCpf = await prisma.user.findUnique({
      where: { cpf: body.cpf },
    });

    if (existingCpf) {
      throw new BadRequestError("CPF já registrado.");
    }

    if (body.userType === "business") {
      if (!body.companyName || !body.cnpj || !body.positionCompany) {
        throw new BadRequestError(
          "Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo 'business'."
        );
      }

      const existingCompany = await prisma.company.findUnique({
        where: { cnpj: body.cnpj },
      });

      if (existingCompany) {
        throw new BadRequestError("Empresa já cadastrada com este CNPJ.");
      }
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const userData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      password_hash: hashedPassword,
      cpf: body.cpf,
      user_type: body.userType,
    };

    const newUser = await prisma.user.create({ data: userData });
    let newCompany = null;

    if (body.userType === "person") {
      newCompany = await prisma.company.create({
        data: {
          company_name: body.name,
          cnpj: null,
          position_company: null,
          subscription_plan: "free",
          owner_id: newUser.id,
        },
      });

      await prisma.company_user.create({
        data: {
          user_id: newUser.id,
          company_id: newCompany.id,
          role: "admin",
        },
      });
    }

    if (body.userType === "business") {
      newCompany = await prisma.company.create({
        data: {
          company_name: body.companyName ?? body.name,
          cnpj: body.cnpj,
          position_company: body.positionCompany,
          subscription_plan: body.subscriptionPlan,
          owner_id: newUser.id,
        },
      });

      await prisma.company_user.create({
        data: {
          user_id: newUser.id,
          company_id: newCompany.id,
          role: "admin",
        },
      });
    }

    return {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      cpf: newUser.cpf,
      userType: newUser.user_type,
      company: newCompany
        ? {
            id: newCompany.id,
            companyName: newCompany.company_name,
            positionCompany: newCompany.position_company,
            cnpj: newCompany.cnpj,
            subscriptionPlan: newCompany.subscription_plan,
          }
        : null,
    };
  },

  async getAllUsers(companyId?: string) {
    const users = await prisma.user.findMany({
      include: {
        company_user: {
          include: {
            company: true,
          },
          ...(companyId && { where: { company_id: companyId } }),
        },
      },
      ...(companyId && {
        where: {
          company_user: {
            some: { company_id: companyId },
          },
        },
      }),
    });

    return users.map((user) => {
      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        userType: user.user_type,
        cpf: user.cpf,
        companies: user.company_user.map((companyUser) => ({
          id: companyUser.company.id,
          companyName: companyUser.company.company_name,
          cnpj: companyUser.company.cnpj ?? undefined,
          positionCompany: companyUser.company.position_company ?? undefined,
          subscriptionPlan: companyUser.company.subscription_plan,
          role: companyUser.role,
        })),
      };

      return userResponse;
    });
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company_user: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestError("Usuário não encontrado.");
    }

    const userResponse: UserResponse & { company?: any } = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      userType: user.user_type,
      cpf: user.cpf,
      companies: user.company_user.map((companyUser) => ({
        id: companyUser.company.id,
        companyName: companyUser.company.company_name,
        cnpj: companyUser.company.cnpj ?? undefined,
        positionCompany: companyUser.company.position_company ?? undefined,
        subscriptionPlan: companyUser.company.subscription_plan,
        role: companyUser.role, // Inclua o papel do usuário na empresa, se necessário
      })),
    };

    return userResponse;
  },

  async updateUser(id: string, body: z.infer<typeof updateSchema>) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestError("Usuário não encontrado");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      userType: updatedUser.user_type,
      cpf: updatedUser.cpf,
    };
  },

  async addUserToCompany(
    body: z.infer<typeof addUserToCompanySchema> & { userId: string }
  ) {
    const { email, companyId, role, name, phone, cpf, userType, userId } = body;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestError("Empresa não encontrada.");
    }

    const requester = await prisma.company_user.findFirst({
      where: {
        user_id: userId,
        company_id: companyId,
        role: "admin",
      },
    });

    if (!requester) {
      throw new UnauthorizedError(
        "Apenas administradores podem adicionar usuários a esta empresa."
      );
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      if (!name || !phone || !cpf || !userType) {
        throw new BadRequestError(
          "Para cadastrar um novo usuário, os campos name, phone, cpf e userType são obrigatórios."
        );
      }
      const randomPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          name,
          phone,
          cpf,
          user_type: userType,
        },
      });

      await sendEmail(
        email,
        "Bem-vindo ao Obra Fácil - Você foi adicionado a uma empresa",
        emailTemplate(company.company_name, randomPassword)
      );
    }

    const existingCompanyUser = await prisma.company_user.findFirst({
      where: {
        user_id: user.id,
        company_id: companyId,
      },
    });

    if (existingCompanyUser) {
      throw new BadRequestError("Usuário já está associado a esta empresa.");
    }

    await prisma.company_user.create({
      data: {
        user_id: user.id,
        company_id: companyId,
        role: role as user_role,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        cpf: user.cpf,
        userType: user.user_type,
      },
      company: {
        id: company.id,
        companyName: company.company_name,
        cnpj: company.cnpj ?? undefined,
        positionCompany: company.position_company ?? undefined,
        subscriptionPlan: company.subscription_plan,
      },
      role,
    };
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    console.log("🔐 Iniciando troca de senha...");
    console.log("➡️ userId:", userId);
    console.log("➡️ currentPassword recebido:", currentPassword);
    console.log("➡️ newPassword recebido:", newPassword);

    if (currentPassword === newPassword) {
      console.log("❌ Senha nova igual à atual");
      throw new BadRequestError("A nova senha deve ser diferente da atual");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado no banco");
      throw new BadRequestError("Usuário não encontrado");
    }

    console.log("🔒 password_hash do banco:", user.password_hash);

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    console.log("🔍 Resultado do bcrypt.compare:", passwordMatch);

    if (!passwordMatch) {
      console.log("❌ Senha atual incorreta");
      throw new BadRequestError("Senha atual incorreta");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError(
        "A nova senha deve ter pelo menos 6 caracteres"
      );
    }

    if (!validatePassword(newPassword)) {
      throw new BadRequestError(
        "A senha deve conter pelo menos 6 caracteres, incluindo maiúsculas, minúsculas e caracteres especiais"
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });

    console.log("✅ Senha atualizada com sucesso!");
    return { success: true };
  },
};
