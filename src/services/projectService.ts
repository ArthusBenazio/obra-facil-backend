import { Projects } from "../entities/project";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { prisma } from "../lib/prisma";
import { ProjectResponse } from "../schemas/projectSchemas";

interface Project {
  company_id: string;
}

export const projectService = {
  async createProject(data: {
    name: string;
    description: string;
    responsible: string;
    engineer?: string;
    crea_number?: string;
    start_date: Date;
    expected_end_date: Date;
    status:
      | "nao_iniciado"
      | "iniciando"
      | "em_andamento"
      | "concluido"
      | "cancelado"
      | "em_espera";
    address: string;
    estimated_budget?: number;
    client: string;
    company_id: string;
  }): Promise<Project> {
    console.log("Dados recebidos no serviço para criar projeto:", data); // Depuração

    const newProject = await prisma.project.create({ data });

    console.log("Projeto criado no banco de dados:", newProject); // Depuração

    return newProject;
  },

  async getAllProjects(companyIds: string[]): Promise<Projects[]> {
    const projects = await prisma.project.findMany({
      where: {
        company_id: { in: companyIds },
      },
    });

    return projects.map((project) => {
      if (
        ![
          "nao_iniciado",
          "iniciando",
          "em_andamento",
          "concluido",
          "cancelado",
          "em_espera",
        ].includes(project.status)
      ) {
        throw new BadRequestError(
          `Status inválido encontrado: ${project.status}`
        );
      }

      return new Projects(
        project.id,
        project.name,
        project.description,
        project.responsible,
        project.start_date,
        project.expected_end_date,
        project.status as ProjectResponse["status"],
        project.address,
        project.client,
        project.company_id ?? "",
        project.created_at,
        project.updated_at,
        project.engineer ?? "",
        project.crea_number ?? "",
        project.estimated_budget ?? 0
      );
    });
  },

  async getProjectById(
    id: string,
    companyIds: string[]
  ): Promise<Projects> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!project) {
      throw new BadRequestError("Projeto não encontrado.");
    }

    const hasPermission = companyIds.includes(project.company_id);

    if (!hasPermission) {
      throw new UnauthorizedError(
        "Você não tem permissão para acessar este projeto."
      );
    }

    return new Projects(
      project.id,
      project.name,
      project.description,
      project.responsible,
      project.start_date,
      project.expected_end_date,
      project.status,
      project.address,
      project.client,
      project.company_id,
      project.created_at,
      project.updated_at,
      project.engineer ?? "",
      project.crea_number ?? "",
      project.estimated_budget ?? 0
    );
  },

  async updateProject(
    id: string,
    data: {
      name: string;
      description: string;
      responsible: string;
      engineer?: string;
      crea_number?: string;
      start_date: Date;
      expected_end_date: Date;
      status:
        | "nao_iniciado"
        | "iniciando"
        | "em_andamento"
        | "concluido"
        | "cancelado"
        | "em_espera";
      address: string;
      estimated_budget?: number;
      client: string;
      company_id: string;
    }
  ): Promise<Projects> {
    const project = await prisma.project.update({
      where: {
        id,
      },
      data,
    });

    if (!project) {
      throw new BadRequestError(`Projeto com o id ${id} não encontrado.`);
    }

    return new Projects(
      project.id,
      project.name,
      project.description,
      project.responsible,
      project.start_date,
      project.expected_end_date,
      project.status as
        | "nao_iniciado"
        | "iniciando"
        | "em_andamento"
        | "concluido"
        | "cancelado"
        | "em_espera",
      project.address,
      project.client,
      project.company_id ?? "",
      project.created_at,
      project.updated_at,
      project.engineer ?? "",
      project.crea_number ?? "",
      project.estimated_budget ?? 0
    );
  },

  async deleteProject(id: string): Promise<void> {
    const project = await prisma.project.delete({
      where: {
        id,
      },
    });

    if (!project) {
      throw new BadRequestError(`Projeto com o id ${id} não encontrado.`);
    }

    return;
  },
};
