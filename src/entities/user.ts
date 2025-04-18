import { user_type } from "@prisma/client";

export class User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  passwordHash: string;
  userType: user_type;
  companyId: string;
  
  constructor(
    id: string,
    name: string,
    phone: string,
    email: string,
    passwordHash: string,
    cpf: string,
    userType: "person" | "business",
    companyId: string
  ) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.passwordHash = passwordHash;
    this.cpf = cpf;
    this.userType = userType;
    this.companyId = companyId
  }
}
