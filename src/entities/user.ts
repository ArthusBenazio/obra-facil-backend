export class User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  passwordHash: string;
  subscriptionPlan: "free" | "basic" | "premium" | "premium_plus";
  role: "admin" | "team" | "client";
  userType: "person" | "business";
  companyId?: string | null 
  
  constructor(
    id: string,
    name: string,
    phone: string,
    email: string,
    passwordHash: string,
    cpf: string,
    subscriptionPlan: "free" | "basic" | "premium" | "premium_plus",
    role: "admin" | "team" | "client",
    userType: "person" | "business",
    companyId?: string | null
  ) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.passwordHash = passwordHash;
    this.cpf = cpf;
    this.subscriptionPlan = subscriptionPlan;
    this.role = role;
    this.userType = userType;
    this.companyId = companyId
  }
}
