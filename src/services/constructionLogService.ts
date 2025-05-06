import { prisma } from "../lib/prisma.js";
import { ConstructionLog } from "../entities/constructionLog.js";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros.js";
import { attachment_type, Climate, Condition, Period } from "@prisma/client";

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

  async getConstructionLogById(
    id: string,
    date?: Date
  ): Promise<ConstructionLog> {
    const dateFilter = date ? { date: { equals: date } } : {};

    const constructionLogs = await prisma.construction_log.findUnique({
      where: { id, ...dateFilter },
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        attachments: true,
        employees: {
          include: {
            employee: {
              select: {
                name: true,
              },
            },
          },
        },
        equipment_usage: {
          include: {
            equipment: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!constructionLogs) {
      throw new BadRequestError("Diario de obra nao encontrado");
    }

    return constructionLogs;
  },

  async getAllConstructionLogs(
    projectId: string,
    userId: string,
    start_date?: string,
    end_date?: string
  ): Promise<ConstructionLog[]> {
    const parseDate = (dateStr: string, endOfDay = false): Date => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error(`Formato de data inválido: ${dateStr}. Use YYYY-MM-DD`);
      }
      if (endOfDay) {
        date.setUTCHours(23, 59, 59, 999);
      } else {
        date.setUTCHours(0, 0, 0, 0);
      }
      return date;
    };

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, company_id: true },
    });

    if (!project) {
      throw new BadRequestError("Projeto não encontrado.");
    }

    const GetDateFilter: any = {};

    if (start_date) {
      GetDateFilter.gte = parseDate(start_date);
    }

    if (end_date) {
      GetDateFilter.lte = parseDate(end_date, true);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, company_user: { select: { company_id: true } } },
    });

    if (!user) {
      throw new UnauthorizedError("Usuário não encontrado.");
    }

    const userCompanyIds = user.company_user.map((cu) => cu.company_id);
    const hasAccess = userCompanyIds.includes(project.company_id);

    if (!hasAccess) {
      throw new UnauthorizedError("Você não tem acesso a este projeto.");
    }

    const whereClause = {
      project_id: projectId,
      ...(Object.keys(GetDateFilter).length > 0 && { date: GetDateFilter }),
    };

    const constructionLogs = await prisma.construction_log.findMany({
      where: whereClause,
      include: {
        weathers: true,
        occurrences: {
          include: {
            employee: {
              select: {
                name: true,
              },
            },
          },
        },
        services: true,
        attachments: true,
        employees: {
          include: {
            employee: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
        equipment_usage: {
          include: {
            equipment: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return constructionLogs.map((log) => ({
      ...log,
      employees:
        log.employees?.map((emp) => ({
          hours_worked: emp.hours_worked,
          employee_id: emp.employee_id,
          comments: emp.comments || null,
          employee: emp.employee
            ? {
                name: emp.employee.name,
                role: emp.employee.role || null,
              }
            : null,
        })) || [],
      equipment_usage:
        log.equipment_usage?.map((eq) => ({
          equipment_id: eq.equipment_id,
          quantity: eq.quantity,
          equipment: eq.equipment
            ? {
                name: eq.equipment.name,
              }
            : null,
        })) || [],
    }));
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
      throw new BadRequestError("Diário de obra não encontrado");
    }

    const transaction = await prisma.$transaction(async (prisma) => {
      await prisma.weather.deleteMany({ where: { construction_log_id: id } });
      await prisma.occurrence.deleteMany({
        where: { construction_log_id: id },
      });
      await prisma.service.deleteMany({ where: { construction_log_id: id } });
      await prisma.attachment.deleteMany({
        where: { construction_log_id: id },
      });
      await prisma.construction_log_employee.deleteMany({
        where: { construction_log_id: id },
      });
      await prisma.equipment_usage.deleteMany({
        where: { construction_log_id: id },
      });

      const updated = await prisma.construction_log.update({
        where: { id },
        data: {
          ...(data.date && { date: data.date }),
          ...(data.project_id && {
            project: { connect: { id: data.project_id } },
          }),
          ...(data.tasks !== undefined && { tasks: data.tasks }),
          ...(data.comments !== undefined && { comments: data.comments }),
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
                  employee: occurrence.employee_id
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

      return updated;
    });

    return transaction;
  },
};
