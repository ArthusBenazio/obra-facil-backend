export class User {
    constructor(id, name, phone, email, passwordHash, cpf, userType, companyId) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.cpf = cpf;
        this.userType = userType;
        this.companyId = companyId;
    }
}
