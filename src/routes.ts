import { FastifyInstance } from "fastify";
import authController from "./controllers/authController";
import userController from "./controllers/userController";

export default async function routes(server: FastifyInstance) {
  server.register(authController);
  server.register(userController);
}
