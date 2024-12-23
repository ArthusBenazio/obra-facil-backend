import fastify from 'fastify';
import fastifyJWT from 'fastify-jwt';
import authController from './controllers/authController';
import userController from './controllers/userController';
import { errorHandler } from './middlewares/errorHandler';
import cors from '@fastify/cors';

const server = fastify();

// Registre o CORS no servidor
server.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:8082'],// Domínio do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  credentials: true, // Para permitir cookies, se necessário
});

server.register(fastifyJWT, {
  secret: process.env.JWT_SECRET || 'mysecretkey',
});

server.register(authController);
server.register(userController);

server.setErrorHandler(errorHandler);

server.listen({ port: 5000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em ${address}`);
});