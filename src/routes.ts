import { FastifyInstance } from "fastify";
import authController from "./controllers/authController";
import userController from "./controllers/userController";
import { projectController } from "./controllers/projectController";

export default async function routes(server: FastifyInstance) {
  server.register(authController);
  server.register(userController);
  server.register(projectController)
}
