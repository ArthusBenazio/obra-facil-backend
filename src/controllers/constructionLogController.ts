import { User } from "../entities/user";
import { UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  constructionLogResponseSchema,
  constructionLogSchema,
  updateLogSchema,
} from "../schemas/constrructionLogSchema";
import { parse } from "date-fns";
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
        tags: ["Diary"],
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
          tasks: body.tasks,
          comments: body.comments,
          weathers: body.weathers,
          occurrences: body.occurrences,
          services: body.services,
          employees: body.employees,
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
        response: {
          200: constructionLogResponseSchema.array(),
        },
        tags: ["Diary"],
      },
    },
    async (request, reply) => {
      const constructionLogs = await ConstructionLogService.getAllConstructionLogs();
      const constructionLogResponse = constructionLogResponseSchema.array().parse(constructionLogs);
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
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const constructionLog = await ConstructionLogService.getConstructionLogById(id);
      const constructionLogResponse = constructionLogResponseSchema.parse(constructionLog);
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

      const updatedConstructionLog = await ConstructionLogService.updateConstructionLog(id, {
        ...body,
        date: body.date ? parse(body.date, "dd/MM/yyyy", new Date()) : undefined,
      });

      const constructionLogResponse = constructionLogResponseSchema.parse(updatedConstructionLog);
      return reply.status(200).send(constructionLogResponse);
    }
  );
  
}
