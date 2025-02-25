import { UnauthorizedError } from "../helpers/api-erros";
import { FastifyReply, FastifyRequest } from "fastify";

interface TokenPayload {
  userId: string;
  companyId: string;
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
  request.user = {
    userId: decoded.userId, 
    companyIds: decoded.companyId,
  };

  // Se a verificação falhar, o erro será lançado
  if (!decoded) {
    throw new UnauthorizedError('Token inválido ou expirado');
  }

  // Anexa as informações do usuário à requisição
  request.user = decoded;
}
