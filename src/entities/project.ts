export class Projects {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public responsible: string,
    public start_date: Date,
    public expected_end_date: Date,
    public status:
      | "nao_iniciado"
      | "iniciando"
      | "em_andamento"
      | "concluido"
      | "cancelado"
      | "em_espera",
    public address: string,
    public client: string,
    public company_id: string,
    public created_at: Date,
    public updated_at: Date,
    public engineer?: string,
    public crea_number?: string,
    public estimated_budget?: number
  ) {}
}
