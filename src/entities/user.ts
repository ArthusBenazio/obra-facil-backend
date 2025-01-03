export class User {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  cpf: string;
  subscriptionPlan: string;
  role: string;
  userType: "person" | "business";
  companyName: string;
  cnpj: string;
  positionCompany: string;

  constructor(
    id: string,
    name: string,
    phone: string,
    email: string,
    passwordHash: string,
    cpf: string,
    subscriptionPlan: string,
    role: string,
    userType: "person" | "business",
    companyName: string,
    cnpj: string,
    positionCompany: string
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
    this.companyName = companyName;
    this.cnpj = cnpj;
    this.positionCompany = positionCompany;
  }
}
