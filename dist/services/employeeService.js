import { prisma } from "../lib/prisma";
import { formatDate } from "../utils/formatedDate";
export const employeeService = {
    async createEmployee(data) {
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
    async getAllEmployees(companyId, status) {
        const employees = await prisma.employee.findMany({
            where: {
                company_id: companyId,
                status: status ? status : undefined,
            },
        });
        return employees;
    },
    async getEmployeeById(id) {
        return prisma.employee.findUnique({
            where: {
                id,
            },
        });
    },
    async updateEmployee(id, data) {
        return prisma.employee.update({
            where: {
                id,
            },
            data,
        });
    },
    async deleteEmployee(id) {
        return prisma.employee.delete({
            where: {
                id,
            },
        });
    },
    async getReportHoursWorked(project_id, start_date, end_date) {
        const parseDate = (dateStr, endOfDay = false) => {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                throw new Error(`Formato de data inválido: ${dateStr}. Use YYYY-MM-DD`);
            }
            if (endOfDay) {
                date.setUTCHours(23, 59, 59, 999);
            }
            else {
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
        const dateFilter = {};
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
        const groupedReport = report.reduce((acc, entry) => {
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
        }, []);
        return groupedReport;
    },
};
