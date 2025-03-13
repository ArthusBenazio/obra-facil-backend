import { FastifyInstance } from "fastify";
import { authController } from "./controllers/authController";
import { userController } from "./controllers/userController";
import { projectController } from "./controllers/projectController";
import { employeeController } from "./controllers/employeeController";
import { constructionLogController } from "./controllers/constructionLogController";
import { equipmentController } from "./controllers/equipmentController";
import { emailController } from "./controllers/emailController";

export default async function routes(server: FastifyInstance) {
  server.register(authController);
  server.register(userController);
  server.register(projectController);
  server.register(employeeController);
  server.register(constructionLogController);
  server.register(equipmentController)
  server.register(emailController)
}
