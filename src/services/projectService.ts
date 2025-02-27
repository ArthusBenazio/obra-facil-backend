import { Projects } from "../entities/project";
import { prisma } from "../lib/prisma";
import { ProjectResponse } from "../schemas/projectSchemas";

interface Project {
  id: string;
  company_id: string | null;
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
    assigned_user_id?: string;
    user_id: string;
    company_id?: string | null;
  }): Promise<Project> {
    if (data.assigned_user_id) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assigned_user_id },
      });

      if (!assignedUser) {
        throw new Error("Usuário atribuído não encontrado.");
      }
    }

    return prisma.project.create({ data });
  },

  async getAllProjects(userId: string, companyId: string): Promise<Projects[]> {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { company_id: companyId },
          { user_id: userId },
          { assigned_user_id: userId },
        ],
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
        throw new Error(`Status inválido encontrado: ${project.status}`);
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
        project.user_id,
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
    userId: string,
    companyId?: string | null
  ): Promise<Projects> {
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { company_id: companyId },
          { user_id: userId },
          { assigned_user_id: userId },
        ],
      },
    });

    if (!project) {
      throw new Error(
        "Projeto não encontrado ou você não tem permissão para acessá-lo."
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
      project.company_id ?? "",
      project.user_id,
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
      user_id: string;
      assigned_user_id?: string;
      company_id: string | null;
    }
  ): Promise<Projects> {
    if (data.assigned_user_id) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assigned_user_id },
      });

      if (!assignedUser) {
        throw new Error("Usuário atribuído não encontrado.");
      }
    }

    const project = await prisma.project.update({
      where: {
        id,
      },
      data,
    });

    if (!project) {
      throw new Error(`Projeto com o id ${id} não encontrado.`);
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
      project.user_id,
      project.created_at,
      project.updated_at,
      project.engineer ?? "",
      project.crea_number ?? "",
      project.estimated_budget ?? 0
    );
  },

  async deleteProject(id: string): Promise<void> {
    await prisma.project.delete({
      where: {
        id,
      },
    });

    return;
  },
};
