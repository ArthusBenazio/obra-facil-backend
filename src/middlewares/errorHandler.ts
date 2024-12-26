import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { ApiError, BadRequestError } from '../helpers/api-erros';

export const errorHandler = (
  error: Error & Partial<ApiError>,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((e) => ({
      field: e.path.join('.'),
      validation: e.code,
      message: e.message,
    }));
    return reply.status(400).send({
      message: 'Erro de validação',
      errors: validationErrors,
    });
  } else if (error instanceof BadRequestError) {
    reply.status(error.statusCode ?? 400).send({ message: error.message });
  } else {
    reply.status(500).send({ message: 'Erro interno do servidor' });
  }

  console.error(error); 
};
