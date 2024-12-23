import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { User } from '../entities/user';
import { BadRequestError } from '../helpers/api-erros';

export const registerSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .min(1, 'Nome é obrigatório'), 
  email: z.string()
    .email('E-mail inválido')
    .min(1, 'E-mail é obrigatório'), 
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .min(1, 'Senha é obrigatória'), 
  subscriptionPlan: z.string().optional(),
  role: z.string().optional(),
});

export const usersService = {
  async registerUser(body: z.infer<typeof registerSchema>) {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestError('E-mail já registrado.');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password_hash: hashedPassword,
        subscription_plan: body.subscriptionPlan ?? 'basic',
        role: body.role ?? 'standart',
      },
    });

    return new User(
      newUser.id,
      newUser.name,
      newUser.email,
      newUser.password_hash,
      newUser.subscription_plan,
      newUser.role
    );
  },

  async getAllUsers() {
    const users = await prisma.user.findMany();
    return users;
  },

}