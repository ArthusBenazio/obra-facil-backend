import { FastifyInstance } from "fastify";
import { authController } from "./controllers/authController.js";
import { userController } from "./controllers/userController.js";
import { projectController } from "./controllers/projectController.js";
import { employeeController } from "./controllers/employeeController.js";
import { constructionLogController } from "./controllers/constructionLogController.js";
import { equipmentController } from "./controllers/equipmentController.js";
import { emailController } from "./controllers/emailController.js";

export default async function routes(server: FastifyInstance) {
  server.register(authController);
  server.register(userController);
  server.register(projectController);
  server.register(employeeController);
  server.register(constructionLogController);
  server.register(equipmentController)
  server.register(emailController)
}
