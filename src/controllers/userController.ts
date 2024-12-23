import { FastifyInstance } from "fastify";
import { registerSchema, usersService } from "../services/userService";
import { UserResponse } from "../types/userTypes";

export default async function userController(server: FastifyInstance) {
  server.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);

      const newUser = await usersService.registerUser(body);

      const userResponse: UserResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        subscriptionPlan: newUser.subscriptionPlan,
        role: newUser.role,
      };

      return reply.status(201).send(userResponse);
  });

  server.get("/profile", async (request, reply) => {
    
      const users = await usersService.getAllUsers();

      return reply.status(200).send(users);
  });
}
