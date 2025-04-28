export class Projects {
    constructor(id, name, description, responsible, start_date, expected_end_date, status, address, client, company_id, created_at, updated_at, engineer, crea_number, estimated_budget) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.responsible = responsible;
        this.start_date = start_date;
        this.expected_end_date = expected_end_date;
        this.status = status;
        this.address = address;
        this.client = client;
        this.company_id = company_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.engineer = engineer;
        this.crea_number = crea_number;
        this.estimated_budget = estimated_budget;
    }
}
