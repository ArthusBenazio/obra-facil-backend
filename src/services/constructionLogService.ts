import { prisma } from "../lib/prisma";
import { ConstructionLog } from "../entities/constructionLog";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { attachment_type, Climate, Condition, Period } from "@prisma/client";
import { date } from "zod";

export const ConstructionLogService = {
  async createContructionLog(data: {
    date: Date;
    project_id: string;
    tasks?: string;
    comments?: string;
    weathers: { period: string; climate: string; condition: string }[];
    occurrences?: { type: string; description: string; employee_id?: string }[];
    services?: { name: string; description: string; value: number }[];
    attachments?: { url: string; type: attachment_type }[];
    employees: { hours_worked: number; employee_id: string }[];
    equipment_usage?: { equipment_id: string; quantity: number }[];
  }): Promise<ConstructionLog> {
    const projectExists = await prisma.project.findUnique({
      where: { id: data.project_id },
    });

    if (!projectExists) {
      throw new BadRequestError("Projeto nao encontrado");
    }

    const occurrencesData = data.occurrences || [];
    const servicesData = data.services || [];
    const attachmentsData = data.attachments || [];
    const employeesData = data.employees || [];
    const equipmentUsageData = data.equipment_usage || [];

    const constructionLog = await prisma.construction_log.create({
      data: {
        date: data.date,
        project: { connect: { id: data.project_id } },
        tasks: data.tasks,
        comments: data.comments,
        weathers: {
          create: data.weathers.map((weather) => ({
            period: weather.period as Period,
            climate: weather.climate as Climate,
            condition: weather.condition as Condition,
          })),
        },
        occurrences: {
          create: occurrencesData.map((occurrence) => ({
            type: occurrence.type,
            description: occurrence.description,
            employee_id: occurrence.employee_id || undefined,
          })),
        },
        services: {
          create: servicesData.map((service) => ({
            name: service.name,
            description: service.description,
            value: service.value,
          })),
        },
        attachments: {
          create: attachmentsData.map((attachment) => ({
            url: attachment.url,
            type: attachment.type,
          })),
        },
        employees: {
          create: await Promise.all(
            employeesData.map(async (employee) => {
              const employeeData = await prisma.employee.findUnique({
                where: { id: employee.employee_id },
                select: { role: true },
              });

              if (!employeeData) {
                throw new BadRequestError(
                  `Funcionário com ID ${employee.employee_id} não encontrado`
                );
              }

              return {
                hours_worked: employee.hours_worked,
                role: employeeData.role,
                employee: { connect: { id: employee.employee_id } },
              };
            })
          ),
        },
        equipment_usage: {
          create: equipmentUsageData.map((usage) => ({
            equipment: { connect: { id: usage.equipment_id } },
            quantity: usage.quantity,
          })),
        },
      },
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        attachments: true,
        employees: true,
        equipment_usage: true,
      },
    });

    return constructionLog;
  },

  async getConstructionLogById(id: string, date?: Date): Promise<ConstructionLog> {
    console.log("id", id);
    const dateFilter = date ? { date: { equals: date } } : {};

    const constructionLog = await prisma.construction_log.findUnique({
      where: { id, ...dateFilter },
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        attachments: true,
        employees: true,
        equipment_usage: true,
      },
    });

    if (!constructionLog) {
      throw new BadRequestError("Diario de obra nao encontrado");
    }

    return constructionLog;
  },

  async getAllConstructionLogs(
    projectId: string,
    userId: string,
    date?: Date
  ): Promise<ConstructionLog[]> {
    console.log("projectId", projectId);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, company_id: true },
    });
    console.log("dados do projeto", project);

    if (!project) {
      throw new BadRequestError("Projeto não encontrado.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, company_user: { select: { company_id: true } } },
    });
  
    if (!user) {
      throw new UnauthorizedError("Usuário não encontrado.");
    }

    // Verifica se o usuário tem acesso ao projeto
    const userCompanyIds = user.company_user.map((cu) => cu.company_id);
    const hasAccess = userCompanyIds.includes(project.company_id);

    if (!hasAccess) {
      throw new UnauthorizedError("Você não tem acesso a este projeto.");
    }

    const dateFilter = date ? { date } : {};

    // Retorna os diários apenas da obra específica
    const constructionLogs = await prisma.construction_log.findMany({
      where: { project_id: projectId, ...dateFilter },
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        attachments: true,
        employees: true,
        equipment_usage: true,
      },
    });

    return constructionLogs;
  },

  async updateConstructionLog(
    id: string,
    data: {
      date?: Date;
      project_id?: string;
      tasks?: string | null;
      comments?: string | null;
      weathers?: { period: string; climate: string; condition: string }[];
      occurrences?: {
        type: string;
        description: string;
        employee_id?: string | null;
      }[];
      services?: { name: string; description: string; value: number }[];
      attachments?: { url: string; type: attachment_type }[];
      employees?: { hours_worked: number; employee_id: string }[];
      equipment_usage?: { equipment_id: string; quantity: number }[];
    }
  ): Promise<ConstructionLog> {
    const constructionLog = await prisma.construction_log.findUnique({
      where: { id },
    });

    if (!constructionLog) {
      throw new BadRequestError("Diario de obra não encontrado");
    }

    const updatedConstructionLog = await prisma.construction_log.update({
      where: { id },
      data: {
        ...(data.date && { date: data.date }),
        ...(data.project_id && {
          project: { connect: { id: data.project_id } },
        }),
        ...(data.tasks && { tasks: data.tasks }),
        ...(data.comments && { comments: data.comments }),
        weathers: data.weathers
          ? {
              create: data.weathers.map((weather) => ({
                period: weather.period as Period,
                climate: weather.climate as Climate,
                condition: weather.condition as Condition,
              })),
            }
          : undefined,
        occurrences: data.occurrences
          ? {
              create: data.occurrences.map((occurrence) => ({
                type: occurrence.type,
                description: occurrence.description,
                employee_id: occurrence.employee_id
                  ? { connect: { id: occurrence.employee_id } }
                  : undefined,
              })),
            }
          : undefined,
        services: data.services
          ? {
              create: data.services.map((service) => ({
                name: service.name,
                description: service.description,
                value: service.value,
              })),
            }
          : undefined,
        attachments: data.attachments
          ? {
              create: data.attachments.map((attachment) => ({
                url: attachment.url,
                type: attachment.type,
              })),
            }
          : undefined,
        employees: data.employees
          ? {
              create: await Promise.all(
                data.employees.map(async (employee) => {
                  const existingEmployee = await prisma.employee.findUnique({
                    where: { id: employee.employee_id },
                    select: { role: true },
                  });

                  if (!existingEmployee) {
                    throw new BadRequestError(
                      `Funcionário com ID ${employee.employee_id} não encontrado`
                    );
                  }

                  return {
                    hours_worked: employee.hours_worked,
                    role: existingEmployee.role,
                    employee: { connect: { id: employee.employee_id } },
                  };
                })
              ),
            }
          : undefined,
        equipment_usage: data.equipment_usage
          ? {
              create: data.equipment_usage.map((usage) => ({
                equipment: { connect: { id: usage.equipment_id } },
                quantity: usage.quantity,
              })),
            }
          : undefined,
      },
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        attachments: true,
        employees: true,
        equipment_usage: true,
      },
    });

    return updatedConstructionLog;
  },
};
