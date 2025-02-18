import { User } from "../entities/user";

export interface AuthenticatedUser extends User {
    userId: string;
  }