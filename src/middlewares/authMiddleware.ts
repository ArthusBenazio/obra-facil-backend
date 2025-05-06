import { UnauthorizedError } from "../helpers/api-erros.js";
import { FastifyReply, FastifyRequest } from "fastify";

export interface TokenPayload {
  userId: string;
  companyIds: string[];
}
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Extrai o token do header Authorization
  const token = request.headers['authorization']?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Token não fornecido');
  }

  // Usando o método de verificação do fastify-jwt
  const decoded = request.server.jwt.verify<TokenPayload>(token);

  if (!decoded) {
    throw new UnauthorizedError('Token inválido ou expirado');
  }

  request.user = {
    userId: decoded.userId, 
    companyIds: decoded.companyIds || [],
  };
  
}
