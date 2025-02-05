import { prisma } from "../lib/prisma";
import { ConstructionLog } from "../entities/constructionLog";
import { BadRequestError } from "../helpers/api-erros";
import { Climate, Condition, Period } from "@prisma/client";

export const ConstructionLogService = {
  async createContructionLog(data: {
    date: Date;
    project_id: string;
    tasks: string;
    comments: string;
    weathers: { period: string; climate: string; condition: string }[];
    occurrences: { type: string; description: string; employee_id?: string }[];
    services: { name: string; description: string; value: number }[];
    employees: { hours_worked: number; employee_id: string }[];
  }): Promise<ConstructionLog> {
    const projectExists = await prisma.project.findUnique({
      where: { id: data.project_id },
    });

    if (!projectExists) {
      throw new BadRequestError("Projeto nao encontrado");
    }

    const occurrencesData = await Promise.all(
      data.occurrences.map(async (occurrence) => {
        const occurrenceData: any = {
          type: occurrence.type,
          description: occurrence.description,
        };

        if (occurrence.employee_id) {
          const employee = await prisma.employee.findUnique({
            where: { id: occurrence.employee_id },
            select: { role: true },
          });

          if (!employee) {
            throw new BadRequestError(
              `Funcionário com ID ${occurrence.employee_id} não encontrado`
            );
          }

          occurrenceData.employee = { connect: { id: occurrence.employee_id } };
          occurrenceData.occurrence_employees = {
            create: [
              {
                employee: { connect: { id: occurrence.employee_id } },
                role: employee.role,
              },
            ],
          };
        }

        return occurrenceData;
      })
    );

    const employeeData = await Promise.all(
      data.employees.map(async (employee) => {
        const existingEmployee = await prisma.employee.findUnique({
          where: { id: employee.employee_id },
          select: { role: true },
        });

        if (!existingEmployee) {
          throw new BadRequestError(
            `Funcionário com ID ${employee.employee_id} nao encontrado`
          );
        }

        return {
          hours_worked: employee.hours_worked,
          role: existingEmployee.role,
          employee: { connect: { id: employee.employee_id } },
        };
      })
    );

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
          create: occurrencesData,
        },
        services: {
          create: data.services.map((service) => ({
            name: service.name,
            description: service.description,
            value: service.value,
          })),
        },
        employees: {
          create: employeeData,
        },
      },
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        employees: true,
      },
    });

    return constructionLog;
  },
  
async getConstructionLogById(id: string): Promise<ConstructionLog> {
    const constructionLog = await prisma.construction_log.findUnique({
      where: { id },
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        employees: true,
      },
    });

    if (!constructionLog) {
      throw new BadRequestError("Diario de obra nao encontrado");
    }

    return constructionLog;
  },

  async getAllConstructionLogs(): Promise<ConstructionLog[]> {
    const constructionLogs = await prisma.construction_log.findMany({
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        employees: true,
      },
    });

    return constructionLogs;
  },

  async updateConstructionLog(id: string, data: {
    date?: Date;
    project_id?: string;
    tasks?: string;
    comments?: string;
    weathers?: { period: string; climate: string; condition: string }[];
    occurrences?: { type: string; description: string; employee_id?: string }[];
    services?: { name: string; description: string; value: number }[];
    employees?: { hours_worked: number; employee_id: string }[];
  }): Promise<ConstructionLog> {

    const constructionLog = await prisma.construction_log.findUnique({
      where: { id },
    });

    if (!constructionLog) {
      throw new BadRequestError("Diario de obra não encontrado");
    }

    const updatedConstructionLog = await prisma.construction_log.update({
      where: { id },
      data: {
        ...data.date && { date: data.date },
        ...data.project_id && { project: { connect: { id: data.project_id } } },
        ...data.tasks && { tasks: data.tasks },
        ...data.comments && { comments: data.comments },
        weathers: data.weathers ? {
          create: data.weathers.map((weather) => ({
            period: weather.period as Period,
            climate: weather.climate as Climate,
            condition: weather.condition as Condition,
          }))
        } : undefined,
        occurrences: data.occurrences ? {
          create: data.occurrences.map((occurrence) => ({
            type: occurrence.type,
            description: occurrence.description,
            employee_id: occurrence.employee_id ? { connect: { id: occurrence.employee_id } } : undefined,
          }))
        } : undefined,
        services: data.services ? {
          create: data.services.map((service) => ({
            name: service.name,
            description: service.description,
            value: service.value,
          }))
        } : undefined,
        employees: data.employees ? {
          create: await Promise.all(data.employees.map(async (employee) => {
            const existingEmployee = await prisma.employee.findUnique({
              where: { id: employee.employee_id },
              select: { role: true }, 
            });

            if (!existingEmployee) {
              throw new BadRequestError(`Funcionário com ID ${employee.employee_id} não encontrado`);
            }

            return {
              hours_worked: employee.hours_worked,
              role: existingEmployee.role,
              employee: { connect: { id: employee.employee_id } },
            };
          }))
        } : undefined,
      },
      include: {
        weathers: true,
        occurrences: true,
        services: true,
        employees: true,
      },
    });

    return updatedConstructionLog;
  }
  
};
