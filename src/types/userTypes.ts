import { User } from './../entities/user';

export type UserResponse = Omit<User, 'passwordHash'>;
