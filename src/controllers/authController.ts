import { UserResponse } from "../types/userTypes";
import { authService, loginSchema } from "../services/authServices";
import { LoginResponseSchema } from "../schemas/authSchemas";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";

export async function authController(server: FastifyTypedInstance) {
  server.post("/login", {
    schema: {
      body: loginSchema,
      response: {
        200: LoginResponseSchema,
      },
      tags: ["Auth"],
      description: "Autenticação de usuário",
    }
  }, async (request, reply) => {
    const body = loginSchema.parse(request.body);  

    const user = await authService.loginUser(body);
    const token = authService.generateToken(user, server);

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      subscriptionPlan: user.subscriptionPlan,
      role: user.role,
      userType: user.userType,
      cpf: user.cpf,
      companyId: user.companyId
    };

    return reply.send({ token, user: userResponse });
  });
}
