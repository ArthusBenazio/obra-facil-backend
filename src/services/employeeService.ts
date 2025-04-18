import { employee_status } from "@prisma/client";
import { Employee } from "../entities/employee";
import { User } from "../entities/user";
import { prisma } from "../lib/prisma";
import { formatDate } from "../utils/formatedDate";

type ReportItem = {
  name: string;
  daily_rate: number;
  work_days: { hours_worked: number; created_at: string }[];
};

export const employeeService = {
  async createEmployee(data: {
    name: string;
    phone: string;
    role: string;
    daily_rate: number;
    status: "ativo" | "inativo";
    cpf: string;
    pix_key: string;
    company_id: string;
  }): Promise<Employee> {
    return prisma.employee.create({
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role,
        daily_rate: data.daily_rate,
        status: data.status,
        cpf: data.cpf,
        pix_key: data.pix_key,
        company: {
          connect: {
            id: data.company_id,
          },
        },
      },
    });
  },

  async getAllEmployees(companyId?: string, status?: employee_status): Promise<Employee[]> {
    const employees = await prisma.employee.findMany({
      where: {
        company_id: companyId,
        status: status ? status: undefined,
      },
    });
    return employees;
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: {
        id,
      },
    });
  },

  async updateEmployee(id: string, data: any): Promise<Employee> {
    return prisma.employee.update({
      where: {
        id,
      },
      data,
    });
  },

  async deleteEmployee(id: string): Promise<Employee> {
    return prisma.employee.delete({
      where: {
        id,
      },
    });
  },

  async getReportHoursWorked(
    project_id: string,
    start_date?: string,
    end_date?: string
  ): Promise<any> {
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
      where: {
        id: project_id,
      },
      select: {
        company_id: true,
      },
    });

    if (!project) {
      throw new Error("Projeto não encontrado");
    }

    const dateFilter: any = {};

    if (start_date) {
      dateFilter.gte = parseDate(start_date);
    }

    if (end_date) {
      dateFilter.lte = parseDate(end_date, true);
    }

    const whereClause = {
      employee: {
        company_id: project.company_id,
      },
      construction_log: {
        project_id,
      },
      ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter }),
    };

    const report = await prisma.construction_log_employee.findMany({
      where: whereClause,
      select: {
        employee: {
          select: {
            name: true,
            daily_rate: true,
            company_id: true,
          },
        },
        hours_worked: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const groupedReport = report.reduce<ReportItem[]>((acc, entry) => {
      const { name, daily_rate } = entry.employee;

      let employeeData = acc.find((e) => e.name === name);

      if (!employeeData) {
        employeeData = { name, daily_rate, work_days: [] };
        acc.push(employeeData);
      }
      employeeData.work_days.push({
        hours_worked: entry.hours_worked,
        created_at: formatDate(entry.created_at),
      });

      return acc;
    }, [] as { name: string; daily_rate: number; work_days: { hours_worked: number; created_at: string }[] }[]);
    return groupedReport;
  },
};
