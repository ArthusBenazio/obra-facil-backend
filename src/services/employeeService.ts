import { get } from "http";
import { Employee } from "../entities/employee";
import { User } from "../entities/user";
import { prisma } from "../lib/prisma";

export const employeeService = {
  async createEmployee(data: {
    name: string;
    role: string;
    daily_rate: number;
    status: "ativo" | "inativo";
    project_id: string;
    user_id?: string | null;
    company_id?: string | null;
  }): Promise<Employee> {
    return prisma.employee.create({
      data,
    });
  },

  async getEmployees(user: User): Promise<Employee[]> {
    if (user.companyId) {
      return prisma.employee.findMany({
        where: {
          company_id: user.companyId,
        },
      });
    } else {
      return prisma.employee.findMany({
        where: {
          user_id: user.id,
        },
      });
    }
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
};
