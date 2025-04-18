import { subscription_plan } from "@prisma/client";

export interface CompanyInfo {
  id: string;
  companyName: string;
  cnpj?: string;
  positionCompany?: string;
  subscriptionPlan: subscription_plan;
  role: string;
}