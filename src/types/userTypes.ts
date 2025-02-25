import { subscription_plan, user_type } from "@prisma/client";

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  userType: user_type;
  company: {
    id: string;
    companyName: string;
    cnpj?: string;
    positionCompany?: string;
    subscriptionPlan: subscription_plan;
    role?: string;
  };
};