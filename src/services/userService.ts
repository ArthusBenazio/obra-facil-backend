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
  
      const userType = body.userType === "person" || body.userType === "business" ? body.userType : "person"; 

      if (body.userType === "business") {
        if (!body.companyName || !body.cnpj || !body.positionCompany) {
          throw new BadRequestError("Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo 'business'.");
        }
      }

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
        },
      });

      if (body.userType === "business") {
        const company = await prisma.company.create({
          data: {
            user_id: newUser.id,
            company_name: body.companyName!,
            cnpj: body.cnpj!,
            position_company: body.positionCompany!,
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
          company,
        };
      }
  
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
      const users = await prisma.user.findMany(
        {
          include : {
            companies: true,
          },
        }
      );
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
  
        
        if (user.companies && user.companies.length > 0) {
          userResponse.company = user.companies[0];  
        }
  
        return userResponse;
      });
  
    },

    async getUserById(id: string) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          companies: true,
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
  
      if (user.companies && user.companies.length > 0) {
        userResponse.company = user.companies[0];  
      }
  
      return userResponse;
    },

    async updateUser(id: string, body: Partial<z.infer<typeof registerSchema>>) {
      const user = await prisma.user.findUnique({
        where: { id },
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
    
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updatedData,
        include: {
          companies: {
            select: {
              company_name: true,
              cnpj: true,
              position_company: true,
            },
          },
        },
      });
      
      
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        subscriptionPlan: updatedUser.subscription_plan,
        role: updatedUser.role,
        userType: updatedUser.user_type,
        cpf: updatedUser.cpf,
        companies: updatedUser.companies.map((company) => ({
          companyName: company.company_name,
          cnpj: company.cnpj,
          positionCompany: company.position_company,
        })),
      };
      
    }
    
};
