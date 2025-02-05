export class Employee {
  id: string;
  name: string;
  role: string;
  daily_rate: number;
  status: "ativo" | "inativo";
  cpf: string;
  pix_key: string;
  user_id: string | null;
  company_id: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(
    id: string,
    name: string,
    role: string,
    daily_rate: number,
    status: "ativo" | "inativo",
    cpf: string,
    pix_key: string,
    user_id: string | null = null,
    company_id: string | null = null,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.daily_rate = daily_rate;
    this.status = status;
    this.cpf = cpf;
    this.pix_key = pix_key;
    this.user_id = user_id;
    this.company_id = company_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

