import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { BadRequestError } from "../helpers/api-erros";
import { User } from "../entities/user";
import { UserResponse } from "../types/userTypes";
import { registerSchema } from "../schemas/userSchemas";

export const usersService = {
  async registerUser(body: z.infer<typeof registerSchema>) {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestError("E-mail já registrado.");
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const userData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      password_hash: hashedPassword,
      cpf: body.cpf,
      subscription_plan: body.subscriptionPlan,
      role: body.role,
      user_type: body.userType,
    };

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

      const existingCPF = await prisma.user.findUnique({
        where: { cpf: body.cpf },
      });

      if (existingCPF) {
        throw new BadRequestError("CPF já cadastrado.");
      }

      // Cria o usuário e a empresa
      const newUser = await prisma.user.create({
        data: {
          ...userData,
          companies: {
            create: {
              company_name: body.companyName,
              cnpj: body.cnpj,
              position_company: body.positionCompany,
            },
          },
        },
        include: {
          companies: true,
        },
      });

      await prisma.company_user.create({
        data: {
          user_id: newUser.id,
          company_id: newUser.companies[0].id,
          role: body.role,
        },
      });

      return {
        ...new User(
          newUser.id,
          newUser.name,
          newUser.phone,
          newUser.email,
          newUser.password_hash,
          newUser.cpf,
          newUser.subscription_plan,
          newUser.role,
          newUser.user_type as "person" | "business"
        ),
        company: newUser.companies[0],
      };
    }

    // Cria apenas o usuário (tipo "person")
    const newUser = await prisma.user.create({
      data: userData,
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
      newUser.user_type as "person" | "business"
    );
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
      const userResponse: UserResponse & { company?: any } = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        subscriptionPlan: user.subscription_plan,
        role: user.role,
        userType: user.user_type,
        cpf: user.cpf,
      };

      if (user.company_user && user.company_user.length > 0) {
        userResponse.company = user.company_user[0].company;
      }
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
      subscriptionPlan: user.subscription_plan,
      role: user.role,
      userType: user.user_type,
      cpf: user.cpf,
    };

    if (user.company_user && user.company_user.length > 0) {
      userResponse.company = user.company_user[0].company;
    }

    return userResponse;
  },

  async updateUser(id: string, body: Partial<z.infer<typeof registerSchema>>) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        companies: true,
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
      subscription_plan: body.subscriptionPlan,
      role: body.role,
      user_type: body.userType,
    };

    if (body.password) {
      updatedData.password_hash = await bcrypt.hash(body.password, 10);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new Error("Este e-mail já está em uso por outro usuário.");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
      include: {
        companies: true,
      },
    });

    let updatedCompany = null;

    if (body.userType === "business") {
      if (!body.companyName || !body.cnpj || !body.positionCompany) {
        throw new BadRequestError(
          "Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo 'business'."
        );
      }

      if (user.companies && user.companies.length > 0) {
        updatedCompany = await prisma.company.update({
          where: { id: user.companies[0].id },
          data: {
            company_name: body.companyName,
            cnpj: body.cnpj,
            position_company: body.positionCompany,
          },
        });
      } else {
        updatedCompany = await prisma.company.create({
          data: {
            id: id,
            company_name: body.companyName,
            cnpj: body.cnpj,
            position_company: body.positionCompany,
          },
        });
      }
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      subscriptionPlan: updatedUser.subscription_plan,
      role: updatedUser.role,
      userType: updatedUser.user_type,
      cpf: updatedUser.cpf,
      company: updatedCompany
        ? {
            id: updatedCompany.id,
            user_id: updatedCompany.id,
            company_name: updatedCompany.company_name,
            cnpj: updatedCompany.cnpj,
            position_company: updatedCompany.position_company,
          }
        : null,
    };
  },
};
