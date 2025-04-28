import { project_status } from "@prisma/client";
import { Projects } from "../entities/project";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { prisma } from "../lib/prisma";
export const projectService = {
    async createProject(data) {
        const newProject = await prisma.project.create({ data });
        return newProject;
    },
    async getAllProjects(companyId, statusList) {
        const projects = await prisma.project.findMany({
            where: {
                company_id: companyId,
                ...(statusList ? { status: { in: statusList } } : {}),
            },
        });
        return projects.map((project) => {
            if (!Object.values(project_status).includes(project.status)) {
                throw new BadRequestError(`Status inválido encontrado: ${project.status}`);
            }
            return new Projects(project.id, project.name, project.description, project.responsible, project.start_date, project.expected_end_date, project.status, project.address, project.client, project.company_id ?? "", project.created_at, project.updated_at, project.engineer ?? "", project.crea_number ?? "", project.estimated_budget ?? 0);
        });
    },
    async getProjectById(id, companyIds) {
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
            throw new UnauthorizedError("Você não tem permissão para acessar este projeto.");
        }
        return new Projects(project.id, project.name, project.description, project.responsible, project.start_date, project.expected_end_date, project.status, project.address, project.client, project.company_id, project.created_at, project.updated_at, project.engineer ?? "", project.crea_number ?? "", project.estimated_budget ?? 0);
    },
    async updateProject(id, data) {
        const project = await prisma.project.update({
            where: {
                id,
            },
            data,
        });
        if (!project) {
            throw new BadRequestError(`Projeto com o id ${id} não encontrado.`);
        }
        return new Projects(project.id, project.name, project.description, project.responsible, project.start_date, project.expected_end_date, project.status, project.address, project.client, project.company_id ?? "", project.created_at, project.updated_at, project.engineer ?? "", project.crea_number ?? "", project.estimated_budget ?? 0);
    },
    async deleteProject(id) {
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
