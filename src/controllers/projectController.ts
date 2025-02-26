import { z } from "zod";
import { UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware, TokenPayload } from "../middlewares/authMiddleware";
import {
  ProjectResponse,
  projectResponseSchema,
  projectSchema,
} from "../schemas/projectSchemas";
import { projectService } from "../services/projectService";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";

interface User {
  companyIds: string;
}

export function projectController(server: FastifyTypedInstance) {
  server.post(
    "/project",
    {
      preHandler: [authMiddleware],
      schema: {
        body: projectSchema,
        response: {
          201: projectResponseSchema,
        },
        tags: ["Obras"],
        description: "Cria uma nova obra",
      },
    },
    async (request, reply) => {

      const user = request.user as TokenPayload;

      if (!user || !user.companyIds || user.companyIds.length === 0) {
        throw new UnauthorizedError("Usuário não autenticado ou sem empresas associadas.");
      }

      const body = projectSchema.parse(request.body);

      if (!user.companyIds.map(String).includes(String(body.company_id))) {
        throw new UnauthorizedError("Usuário não tem acesso a essa empresa.");
      }

      if (!user.companyIds.includes(body.company_id)) {
        throw new UnauthorizedError("Usuário não tem acesso a essa empresa.");
      }

      const newProject = await projectService.createProject({
        name: body.name,
        description: body.description,
        responsible: body.responsible,
        engineer: body.engineer,
        crea_number: body.crea_number,
        start_date: body.start_date,
        expected_end_date: body.expected_end_date,
        status: body.status,
        address: body.address,
        estimated_budget: body.estimated_budget,
        client: body.client,
        company_id: body.company_id,
      });

      reply.status(201).send(projectResponseSchema.parse(newProject));
    }
  );

  server.get(
    "/projects",
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
      const user = request.user as TokenPayload;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const { companyIds } = user;

      const projects = await projectService.getAllProjects(companyIds);

      const formattedProjects = projects.map((project) => ({
        ...project,
        status: project.status as ProjectResponse["status"],
      }));

      reply.status(200).send(formattedProjects);
    }
  );

  server.get<{ Params: { id: string } }>(
    "/project/:id",
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
      const user = request.user as TokenPayload;

      if (!user || !user.companyIds || user.companyIds.length === 0) {
        throw new UnauthorizedError("Usuário não autenticado ou sem empresas associadas.");
      }

      const project = await projectService.getProjectById(id, user.companyIds);

      reply.status(200).send(project);
    }
  );

  server.put<{ Params: { id: string } }>(
    "/project/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        body: projectSchema,
        response: {
          200: projectResponseSchema,
        },
        tags: ["Obras"],
        description: "Atualiza uma obra",
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = request.user as TokenPayload;

      if (!user || !user.companyIds || user.companyIds.length === 0) {
        throw new UnauthorizedError("Usuário não autenticado ou sem empresas associadas.");
      }

      const body = projectSchema.parse(request.body);

      if (!user.companyIds.map(String).includes(String(body.company_id))) {
        throw new UnauthorizedError("Usuário não tem acesso a essa empresa.");
      }

      if (!user.companyIds.includes(body.company_id)) {
        throw new UnauthorizedError("Usuário não tem acesso a essa empresa.");
      }

      const updatedProject = await projectService.updateProject(id, {
        name: body.name,
        description: body.description,
        responsible: body.responsible,
        engineer: body.engineer,
        crea_number: body.crea_number,
        start_date: body.start_date,
        expected_end_date: body.expected_end_date,
        status: body.status,
        address: body.address,
        estimated_budget: body.estimated_budget,
        client: body.client,
        company_id: body.company_id,
      });

      reply.status(200).send(projectResponseSchema.parse(updatedProject));
    }
  );

  server.delete<{ Params: { id: string } }>(
    "/project/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        description: "Deleta uma obra por id",
        tags: ["Obras"],
        response: {
          200: z.string(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const deletedProject = await projectService.deleteProject(id);

      reply.status(200).send("Projeto deletado com sucesso!");
    }
  );
}
