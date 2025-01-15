import { Projects } from "../entities/project";
import { prisma } from "../lib/prisma";

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
    status: string;
    address: string;
    estimated_budget?: number;
    client: string;
    created_by_user_id: string;
    company_id: string | null;
  }): Promise<Project> {
    return prisma.project.create({
      data,
    });
  },

  async getAllProjects(
    userId: string,
    company_id: string
  ): Promise<Projects[]> {
    return prisma.project
      .findMany({
        where: {
          OR: [{ company_id: company_id }, { created_by_user_id: userId }],
        },
      })
      .then((projects) =>
        projects.map(
          (project) =>
            new Projects(
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
              project.created_by_user_id,
              project.created_at,
              project.updated_at,
              project.engineer ?? "",
              project.crea_number ?? "",
              project.estimated_budget ?? 0
            )
        )
      );
  },

  async getProjectById(id: string, userId: string): Promise<Projects> {
    const project = await prisma.project.findUnique({
      where: {
        id,
        created_by_user_id: userId,
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
      project.created_by_user_id,
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
      status: string;
      address: string;
      estimated_budget?: number;
      client: string;
      created_by_user_id: string;
      company_id: string | null;
    }
  ): Promise<Projects> {
    return prisma.project
      .update({
        where: {
          id,
        },
        data,
      })
      .then((project) => {
        if (!project) {
          throw new Error(`Project with id ${id} not found`);
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
          project.created_by_user_id,
          project.created_at,
          project.updated_at,
          project.engineer ?? "",
          project.crea_number ?? "",
          project.estimated_budget ?? 0
        );
      });
  },
};
