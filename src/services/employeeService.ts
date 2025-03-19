import { Employee } from "../entities/employee";
import { User } from "../entities/user";
import { prisma } from "../lib/prisma";

type ReportItem = {
  name: string;
  daily_rate: number;
  work_days: { hours_worked: number; created_at: Date }[];
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

  async getAllEmployees(user: User): Promise<Employee[]> {
    const employees = await prisma.employee.findMany({
      where: {
        AND: [{ company_id: user.companyId }],
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
    start_date?: string,
    end_date?: string
  ): Promise<any> {
    let startDate: Date | undefined;
    let endDate: Date = new Date();

    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } 
    const report = await prisma.construction_log_employee.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        employee: {
          select: {
            name: true,
            daily_rate: true,
          },
        },
        hours_worked: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      }
    });

    const groupedReport = report.reduce<ReportItem[]>((acc, entry) => {
      const { name, daily_rate } = entry.employee;

      let employeeData = acc.find(e => e.name === name);

      if (!employeeData) {
        employeeData = { name, daily_rate, work_days: [] };
        acc.push(employeeData);
      }
      employeeData.work_days.push({
        hours_worked: entry.hours_worked,
        created_at: entry.created_at,
      });

      return acc;
  }, [] as { name: string; daily_rate: number; work_days: { hours_worked: number; created_at: Date }[] }[]);
  return groupedReport;
  },
};
