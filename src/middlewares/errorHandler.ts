import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { ApiError } from '../helpers/api-erros.js';

export const errorHandler = (
  error: Error & Partial<ApiError>,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  console.error(error); 

  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((e) => ({
      field: e.path.join('.'),
      validation: e.code,
      message: e.message,
    }));
    return reply.status(400).send({
      statusCode: 400,
      message: 'Erro de validação',
      errors: validationErrors,
    });
  }

  if (error instanceof ApiError) {
    return reply.status(error.statusCode ?? 400).send({ 
      statusCode: error.statusCode ?? 400, 
      message: error.message 
    });
  }

  return reply.status(500).send({ 
    statusCode: 500, 
    message: 'Erro interno do servidor' 
  });
};
