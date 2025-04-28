import { UnauthorizedError } from "../helpers/api-erros";
export async function authMiddleware(request, reply) {
    // Extrai o token do header Authorization
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
        throw new UnauthorizedError('Token não fornecido');
    }
    // Usando o método de verificação do fastify-jwt
    const decoded = request.server.jwt.verify(token);
    if (!decoded) {
        throw new UnauthorizedError('Token inválido ou expirado');
    }
    request.user = {
        userId: decoded.userId,
        companyIds: decoded.companyIds || [],
    };
}
