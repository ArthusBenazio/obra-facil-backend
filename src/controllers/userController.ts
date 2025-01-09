import { usersService } from "../services/userService";
import { UserResponse } from "../types/userTypes";
import { BadRequestError } from "../helpers/api-erros";
import { FastifyTypedInstance } from "../utils/fastifyTypedInstance";
import {
  registerResponseSchema,
  registerSchema,
  userResponseSchema,
} from "../schemas/userSchemas";
import { z } from "zod";

export default async function userController(server: FastifyTypedInstance) {
  server.post(
    "/register",
    {
      schema: {
        body: registerSchema,
        response: {
          201: registerResponseSchema,
        },
        tags: ["User"],
      },
    },
    async (request, reply) => {
      const body = registerSchema.parse(request.body);

      const newUser = await usersService.registerUser(body);

      if (!newUser) {
        throw new BadRequestError("Dados inválidos.");
      }

      const userResponse: UserResponse & { company?: any } = {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        cpf: newUser.cpf,
        email: newUser.email,
        subscriptionPlan: newUser.subscriptionPlan,
        role: newUser.role,
        userType: newUser.userType,
      };

      if (newUser.userType === "business" && "company" in newUser) {
        userResponse.company = {
          companyName: newUser.company.company_name,
          positionCompany: newUser.company.position_company,
          cnpj: newUser.company.cnpj,
        };
      }

      return reply.status(201).send(userResponse);
    }
  );

  server.get(
    "/profile",
    {
      schema: {
        description: "Lista todos os usuários registrados.",
        tags: ["User"],
        response: {
          200: z.array(userResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const users = await usersService.getAllUsers();

      return reply.status(200).send(users);
    }
  );
}
