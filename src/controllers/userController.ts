import { usersService } from "../services/userService";
import { UserResponse } from "../types/userTypes";
import { BadRequestError } from "../helpers/api-erros";
import {
  registerResponseSchema,
  registerSchema,
  updateSchema,
  userResponseSchema,
} from "../schemas/userSchemas";
import { z } from "zod";
import { authMiddleware } from "../middlewares/authMiddleware";
import { FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";

interface ProfileParams {
  id: string;
}

export async function userController(server: FastifyTypedInstance) {
  server.post(
    "/profile",
    {
      schema: {
        body: registerSchema,
        response: {
          201: registerResponseSchema,
        },
        description: "Cria um novo usuário.",
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
    "/profiles",
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

  server.get<{
    Params: ProfileParams;
  }>(
    "/profile/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        description: "Lista informações do usuário.",
        tags: ["User"],
        response: {
          200: userResponseSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Params: ProfileParams }>, reply) => {
      const users = await usersService.getUserById(request.params.id);

      return reply.status(200).send(users);
    }
  );

  server.put(
    "/profile/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        body: updateSchema,
        response: {
          200: userResponseSchema,
        },
        description: "Atualiza informações do usuário.",
        tags: ["User"],
      },
    },
    async (request: FastifyRequest<{ Params: ProfileParams }>, reply) => {
      
      const body = updateSchema.parse(request.body);
  
      const updatedUser = await usersService.updateUser(request.params.id, body);
  
      return reply.status(200).send(updatedUser);
    }
  );
  
}
