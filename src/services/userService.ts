import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { UserResponse } from "../types/userTypes";
import { addUserToCompanySchema, registerSchema } from "../schemas/userSchemas";
import { subscription_plan, user_role } from "@prisma/client";
import { generateRandomPassword } from "../utils/generateRandomPassword";
import { sendEmail } from "./emailService";

export const usersService = {
  async registerUser(body: z.infer<typeof registerSchema>) {
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

      return {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        cpf: newUser.cpf,
        userType: newUser.user_type,
        company: {
          id: newCompany.id,
          companyName: newCompany.company_name,
          positionCompany: newCompany.position_company,
          cnpj: newCompany.cnpj,
          subscriptionPlan: newCompany.subscription_plan,
        },
      };
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

      const newCompany = await prisma.company.create({
        data: {
          company_name: body.companyName,
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

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        cpf: newUser.cpf,
        userType: newUser.user_type,
        company: {
          id: newCompany.id,
          companyName: newCompany.company_name,
          cnpj: newCompany.cnpj,
          positionCompany: newCompany.position_company,
          subscriptionPlan: newCompany.subscription_plan,
        },
      };
    }

    return {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      cpf: newUser.cpf,
      userType: newUser.user_type,
      company: null,
    };
  },

  async getAllUsers() {
    const users = await prisma.user.findMany({
      include: {
        company_user: {
          include: {
            company: true,
          },
        },
      },
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

  async updateUser(id: string, body: Partial<z.infer<typeof registerSchema>>) {
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

    const updatedData: any = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      cpf: body.cpf,
      user_type: body.userType,
    };

    if (body.password) {
      updatedData.password_hash = await bcrypt.hash(body.password, 10);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new BadRequestError(
        "Este e-mail já está em uso por outro usuário."
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
      include: {
        company_user: {
          include: {
            company: true, // Inclua a empresa associada ao usuário
          },
        },
      },
    });

    let updatedCompany = null;

    if (body.userType === "business") {
      if (!body.companyName || !body.cnpj || !body.positionCompany) {
        throw new BadRequestError(
          "Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo 'business'."
        );
      }

      if (user.company_user && user.company_user.length > 0) {
        updatedCompany = await prisma.company.update({
          where: { id: user.company_user[0].company.id },
          data: {
            company_name: body.companyName,
            cnpj: body.cnpj,
            position_company: body.positionCompany,
          },
        });
      } else {
        updatedCompany = await prisma.company.create({
          data: {
            company_name: body.companyName,
            cnpj: body.cnpj,
            position_company: body.positionCompany,
            subscription_plan: body.subscriptionPlan as subscription_plan,
            owner_id: updatedUser.id,
          },
        });
      }
    }

    await prisma.company_user.create({
      data: {
        user_id: updatedUser.id,
        company_id: updatedCompany?.id ?? "",
        role: "admin",
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      userType: updatedUser.user_type,
      cpf: updatedUser.cpf,
      company: updatedCompany
        ? {
            id: updatedCompany.id,
            user_id: updatedCompany.id,
            company_name: updatedCompany.company_name,
            cnpj: updatedCompany.cnpj,
            position_company: updatedCompany.position_company,
            subscription_plan: updatedCompany.subscription_plan,
          }
        : null,
    };
  },

  async addUserToCompany(body: z.infer<typeof addUserToCompanySchema> & { userId: string }) {
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
      throw new UnauthorizedError("Apenas administradores podem adicionar usuários a esta empresa.");
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
        "Bem-vindo ao nosso app!",
        `Sua senha temporária é: ${randomPassword}`
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
};
