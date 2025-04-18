import { employee_status } from "@prisma/client";

export class Employee {
  id: string;
  name: string;
  role: string;
  daily_rate: number;
  status: employee_status;
  cpf: string;
  pix_key: string;
  company_id: string;
  created_at: Date;
  updated_at: Date;

  constructor(
    id: string,
    name: string,
    role: string,
    daily_rate: number,
    status: employee_status,
    cpf: string,
    pix_key: string,
    company_id: string,
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
    this.company_id = company_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

