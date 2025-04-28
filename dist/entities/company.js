export class Company {
    constructor(id, user_id, company_name, cnpj, position_company, subscription_plan, created_at, updated_at) {
        this.id = id;
        this.user_id = user_id;
        this.company_name = company_name;
        this.cnpj = cnpj;
        this.position_company = position_company;
        this.subscription_plan = subscription_plan;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
