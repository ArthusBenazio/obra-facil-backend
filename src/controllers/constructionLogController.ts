import { User } from "../entities/user";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware, TokenPayload } from "../middlewares/authMiddleware";
import {
  constructionLogResponseSchema,
  constructionLogSchema,
  getConstructionLogByIdQuerySchema,
  getConstructionLogQuerySchema,
  updateLogSchema,
} from "../schemas/constrructionLogSchema";
import { ConstructionLogService } from "../services/constructionLogService";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";

export async function constructionLogController(server: FastifyTypedInstance) {
  server.post(
    "/construction-log",
    {
      preHandler: [authMiddleware],
      schema: {
        body: constructionLogSchema,
        response: {
          201: constructionLogResponseSchema,
        },
        tags: ["Diário de Obra"],
        description: "Cria um novo diário de obra",
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const body = constructionLogSchema.parse(request.body);

      const newConstructionLog =
        await ConstructionLogService.createContructionLog({
          date: body.date,
          project_id: body.project_id,
          tasks: body.tasks ?? undefined,
          comments: body.comments ?? undefined,
          weathers: body.weathers,
          occurrences: body.occurrences?.map((occurrence) => ({
            ...occurrence,
            employee_id: occurrence.employee_id ?? undefined,
          })),
          services: body.services,
          employees: body.employees,
          equipment_usage: body.equipment_usage,
        });
      const constructionLogResponse =
        constructionLogResponseSchema.parse(newConstructionLog);
      return reply.status(201).send(constructionLogResponse);
    }
  );

  server.get(
    "/construction-log",
    {
      preHandler: [authMiddleware],
      schema: {
        querystring: getConstructionLogQuerySchema,
        response: {
          200: constructionLogResponseSchema.array(),
        },
        tags: ["Diário de Obra"],
        description: "Retorna os diários de uma obra específica",
      },
    },
    async (request, reply) => {
      const user = request.user as TokenPayload;
      const { project_id, date } = request.query as { project_id: string; date?: Date };

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      if (!project_id) {
        throw new BadRequestError("O ID do projeto é obrigatório.");
      }

      const constructionLogs =
        await ConstructionLogService.getAllConstructionLogs(
          project_id,
          user.userId,
          date ? new Date(date) : undefined
        );

      const constructionLogResponse = constructionLogResponseSchema
        .array()
        .parse(constructionLogs);
      return reply.status(200).send(constructionLogResponse);
    }
  );

  server.get(
    "/construction-log/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        querystring: getConstructionLogByIdQuerySchema,
        response: {
          200: constructionLogResponseSchema,
        },
        tags: ["Diário de Obra"],
        description: "Retorna um diário de obra",
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      console.log("id", id);
      const { date } = request.query as { date?: Date };
      const constructionLog =
        await ConstructionLogService.getConstructionLogById(id, date ? new Date(date) : undefined);
      const constructionLogResponse =
        constructionLogResponseSchema.parse(constructionLog);
      return reply.status(200).send(constructionLogResponse);
    }
  );

  server.put(
    "/construction-log/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        body: updateLogSchema,
        response: {
          200: constructionLogResponseSchema,
        },
        tags: ["Diário de Obra"],
        description: "Atualiza um diário de obra",
      },
    },
    async (request, reply) => {
      const user = request.user as User;
      const { id } = request.params as { id: string };
      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const body = updateLogSchema.parse(request.body);

      const updatedConstructionLog =
        await ConstructionLogService.updateConstructionLog(id, {
          ...body,
        });

      const constructionLogResponse = constructionLogResponseSchema.parse(
        updatedConstructionLog
      );
      return reply.status(200).send(constructionLogResponse);
    }
  );
}
