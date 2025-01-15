import { z } from "zod";
import { UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  projectResponseSchema,
  projectSchema,
} from "../schemas/projectSchemas";
import { FastifyTypedInstance } from "../utils/fastifyTypedInstance";
import { parse } from "date-fns";
import { projectService } from "../services/projectService";

interface User {
  userId: string;
  companyId?: string | null;
}

export function projectController(server: FastifyTypedInstance) {
  server.post(
    "/obras",
    {
      preHandler: [authMiddleware],
      schema: {
        body: projectSchema,
        response: {
          201: projectResponseSchema,
        },
        tags: ["Obras"],
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const body = projectSchema.parse(request.body);

      const startDate = parse(body.start_date, "dd/MM/yyyy", new Date());
      const expectedEndDate = parse(
        body.expected_end_date,
        "dd/MM/yyyy",
        new Date()
      );

      const newProject = await projectService.createProject({
        name: body.name,
        description: body.description,
        responsible: body.responsible,
        engineer: body.engineer,
        crea_number: body.crea_number,
        start_date: startDate,
        expected_end_date: expectedEndDate,
        status: body.status,
        address: body.address,
        estimated_budget: body.estimated_budget,
        client: body.client,
        created_by_user_id: user.userId,
        company_id: user.companyId || null,
      });

      console.log("newProject", newProject);

      reply.status(201).send(projectResponseSchema.parse(newProject));
    }
  );

  server.get(
    "/obras",
    {
      preHandler: [authMiddleware],
      schema: {
        description: "Retorna todas as obras de um usuário ou empresa",
        tags: ["Obras"],
        response: {
          200: z.array(projectResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const { userId, companyId } = user;

      const projects = await projectService.getAllProjects(
        userId,
        companyId ?? ""
      );

      reply.status(200).send(projects);
    }
  );

  server.get<{ Params: { id: string } }>(
    "/obras/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        description: "Retorna uma obra por id",
        tags: ["Obras"],
        response: {
          200: projectResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const project = await projectService.getProjectById(id, user.userId);

      reply.status(200).send(project);
    }
  );

  server.put<{ Params: { id: string } }>(
    "/obras/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        body: projectSchema,
        response: {
          200: projectResponseSchema,
        },
        tags: ["Obras"],
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const body = projectSchema.parse(request.body);

      const startDate = parse(body.start_date, "dd/MM/yyyy", new Date());
      const expectedEndDate = parse(
        body.expected_end_date,
        "dd/MM/yyyy",
        new Date()
      );

      const updatedProject = await projectService.updateProject(id, {
        name: body.name,
        description: body.description,
        responsible: body.responsible,
        engineer: body.engineer,
        crea_number: body.crea_number,
        start_date: startDate,
        expected_end_date: expectedEndDate,
        status: body.status,
        address: body.address,
        estimated_budget: body.estimated_budget,
        client: body.client,
        created_by_user_id: user.userId,
        company_id: user.companyId || null,
      });

      reply.status(200).send(projectResponseSchema.parse(updatedProject));
    }
  );
}
