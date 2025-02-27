import { Employee } from "../entities/employee";
import { User } from "../entities/user";
import { prisma } from "../lib/prisma";

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
        AND: [
          { company_id: user.companyId },
        ],
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
};
