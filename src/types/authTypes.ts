import { user_type } from "@prisma/client";
import { CompanyInfo } from "./companyInfo";

export type authResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  user_type: user_type;
  companies: CompanyInfo[];
};