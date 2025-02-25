import { authService } from "../services/authServices";
import { LoginResponseSchema, loginSchema } from "../schemas/authSchemas";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";

export async function authController(server: FastifyTypedInstance) {
  server.post(
    "/login",
    {
      schema: {
        body: loginSchema,
        response: {
          200: LoginResponseSchema,
        },
        tags: ["Auth"],
        description: "Autenticação de usuário",
      },
    },
    async (request, reply) => {
      const body = loginSchema.parse(request.body);

      const user = await authService.loginUser(body);
      const token = authService.generateToken(user, server);

      const authResponse = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        userType: user.user_type,
        cpf: user.cpf,
        companies: user.companies.map((company) => ({
          id: company.id,
          role: company.role,
          subscriptionPlan: company.subscriptionPlan,
          companyName: company.companyName,
          cnpj: company.cnpj,
          positionCompany: company.positionCompany,
        })),
      };

      console.log(authResponse)

      return reply.send({ token, user: authResponse });
    }
  );
}
