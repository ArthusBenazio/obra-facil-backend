export class User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  subscriptionPlan: string;
  role: string;

  constructor(
    id: string,
    name: string,
    email: string,
    passwordHash: string,
    subscriptionPlan: string,
    role: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.subscriptionPlan = subscriptionPlan;
    this.role = role;
  }
}
