import { employee_status } from "@prisma/client";
import { User } from "../entities/user.js";
import { UnauthorizedError } from "../helpers/api-erros.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  deleteEmployeeResponseSchema,
  employeeResponseSchema,
  querystring,
  querystringGetAll,
  registerEmployeeSchema,
  reportHoursWorkedResponseSchema,
} from "../schemas/employeeSchema.js";
import { employeeService } from "../services/employeeService.js";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance.js";

export async function employeeController(server: FastifyTypedInstance) {
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
      const body = registerEmployeeSchema.parse(request.body);
      const employee = await employeeService.createEmployee({
        ...body,
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
        querystring: querystringGetAll,
        response: {
          200: employeeResponseSchema.array(),
        },
        tags: ["Funcionários"],
        description:
          "Retorna todos os funcionários da empresa do usuário autenticado.",
      },
    },
    async (request, reply) => {
      const companyId = request.query.company_id as string;
      const status = request.query.status as employee_status;

      const employees = await employeeService.getAllEmployees(companyId, status);
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
      await employeeService.deleteEmployee(id);
      return reply.status(200).send("Funcionario deletado com sucesso.");
    }
  );

  server.get(
    "/employees/report", 
    {
      preHandler: [authMiddleware],
      schema: {
        querystring: querystring,
        response: {
          200: reportHoursWorkedResponseSchema,
        },
        tags: ["Relatórios"],
        description: "Retorna o relatório de horas trabalhadas",
      },
    },
    async (request, reply) => {
      const { project_id, start_date, end_date } = request.query;

      if (!project_id) {
        return reply.status(400);
      }

      const employees = await employeeService.getReportHoursWorked(
        project_id,
        start_date,
        end_date
      );
      return reply.status(200).send(employees);
    }
  );
}
