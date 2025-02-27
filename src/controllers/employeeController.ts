import { user } from './../../node_modules/.prisma/client/index.d';
import { User } from "../entities/user";
import { UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  deleteEmployeeResponseSchema,
  employeeResponseSchema,
  registerEmployeeSchema,
} from "../schemas/employeeSchema";
import { employeeService } from "../services/employeeService";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";

export async function employeeController(server: FastifyTypedInstance) {

  interface AuthenticatedUser extends User {
    userId: string;
  }

  server.post(
    "/employee",
    {
      preHandler: [authMiddleware],
      schema: {
        body: registerEmployeeSchema,
        response: {
          201: employeeResponseSchema,
        },
        tags: ["Funcionários"],
        description: "Cria um novo funcionário",
      },
    },
    async (request, reply) => {
      const user = request.user as AuthenticatedUser;

      console.log("Usuário autenticado:", user);

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const body = registerEmployeeSchema.parse(request.body);
      const employee = await employeeService.createEmployee({
        ...body,
        company_id: user.companyId || null,
        user_id: user.companyId ? null : user.userId,
      });

      const employeeResponse = employeeResponseSchema.parse(employee);
      return reply.status(201).send(employeeResponse);
    }
  );

  server.get(
    "/employees",
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: employeeResponseSchema.array(),
        },
        tags: ["Funcionários"],
        description: "Retorna todos os funcionários",
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const employees = await employeeService.getAllEmployees(user);
      const employeesResponse = employeeResponseSchema.array().parse(employees);
      return reply.status(200).send(employeesResponse);
    }
  );

  server.get<{ Params: { id: string } }>(
    "/employee/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: employeeResponseSchema,
        },
        tags: ["Funcionários"],
        description: "Retorna um funcionário",
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const { id } = request.params;
      const employee = await employeeService.getEmployeeById(id);
      const employeeResponse = employeeResponseSchema.parse(employee);
      return reply.status(200).send(employeeResponse);
    }
  );

  server.put<{ Params: { id: string } }>(
    "/employee/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        body: registerEmployeeSchema,
        response: {
          200: employeeResponseSchema,
        },
        tags: ["Funcionários"],
        description: "Atualiza um funcionário",
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const { id } = request.params;
      const body = registerEmployeeSchema.parse(request.body);
      const employee = await employeeService.updateEmployee(id, body);
      const employeeResponse = employeeResponseSchema.parse(employee);
      return reply.status(200).send(employeeResponse);
    }
  );

  server.delete<{ Params: { id: string } }>(
    "/employee/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: deleteEmployeeResponseSchema,
        },
        tags: ["Funcionários"],
        description: "Deleta um funcionário",
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const { id } = request.params;
      const employee = await employeeService.deleteEmployee(id);
      return reply.status(200).send("Funcionario deletado com sucesso.");
    }
  );
}
