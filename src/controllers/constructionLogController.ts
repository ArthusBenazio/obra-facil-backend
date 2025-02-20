import { User } from "../entities/user";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  constructionLogResponseSchema,
  constructionLogSchema,
  updateLogSchema,
} from "../schemas/constrructionLogSchema";
import { parse } from "date-fns";
import { ConstructionLogService } from "../services/constructionLogService";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";
import { z } from "zod";
import { AuthenticatedUser } from "../types/authenticatedUser";

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
        tags: ["Diary"],
        description: "Cria um novo diário de obra",
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const body = constructionLogSchema.parse(request.body);
      console.log("Parsed Body:", body);

      const bodyDate = parse(body.date, "dd/MM/yyyy", new Date());

      const newConstructionLog =
        await ConstructionLogService.createContructionLog({
          date: bodyDate,
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

  const getConstructionLogQuerySchema = z.object({
    project_id: z.string(),
  });

  server.get(
    "/construction-log",
    {
      preHandler: [authMiddleware],
      schema: {
        querystring: getConstructionLogQuerySchema,
        response: {
          200: constructionLogResponseSchema.array(),
        },
        tags: ["Diary"],
        description: "Retorna os diários de uma obra específica",
      },
    },
    async (request, reply) => {
      const user = request.user as AuthenticatedUser;
      const { project_id } = request.query as { project_id: string };

      console.log("user", user);

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      if (!project_id) {
        throw new BadRequestError("O ID do projeto é obrigatório.");
      }

      const constructionLogs =
        await ConstructionLogService.getAllConstructionLogs(
          user.userId,
          project_id
        );
        console.log(user.userId, project_id, constructionLogs);
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
        response: {
          200: constructionLogResponseSchema,
        },
        tags: ["Diary"],
        description: "Retorna um diário de obra",
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const constructionLog =
        await ConstructionLogService.getConstructionLogById(id);
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
        tags: ["Diary"],
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
      console.log("Parsed Body for Update:", body);

      const updatedConstructionLog =
        await ConstructionLogService.updateConstructionLog(id, {
          ...body,
          date: body.date
            ? parse(body.date, "dd/MM/yyyy", new Date())
            : undefined,
        });

      const constructionLogResponse = constructionLogResponseSchema.parse(
        updatedConstructionLog
      );
      return reply.status(200).send(constructionLogResponse);
    }
  );
}
