import { User } from './../entities/user';

export type UserResponse = Omit<User, 'passwordHash'> & {
  companyName?: string; 
  cnpj?: string; 
  positionCompany?: string; 
};
