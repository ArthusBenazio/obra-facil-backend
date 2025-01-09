import { z } from "zod";
import { UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware } from "../middlewares/authMiddleware";
import { projectResponseSchema, projectSchema } from "../schemas/projectSchemas";
import { projectService } from "../services/projectService";
import { FastifyTypedInstance } from "../utils/fastifyTypedInstance";

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

      console.log("user", user);

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const body = projectSchema.parse(request.body);

      const newProject = await projectService.createProject({
        name: body.name,
        description: body.description,
        responsible: body.responsible,
        engineer: body.engineer,
        crea_number: body.crea_number,
        start_date: new Date(body.start_date),
        expected_end_date: new Date(body.expected_end_date),
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
        }
      }
    },
    async (request, reply) => {
  
      const user = request.user as User;
  
      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }
  
      const { userId, companyId } = user;
  
      const projects = await projectService.getAllProjects(userId, companyId ?? "");
  
      reply.status(200).send(projects);
    }
  );
  
}
