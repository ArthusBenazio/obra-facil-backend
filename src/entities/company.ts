export class Company {
  constructor(
    public id: string,
    public user_id: string,
    public company_name: string,
    public cnpj: string,
    public position_company: string,
    public created_at: Date,
    public updated_at: Date
  ) {}
}
