import { prisma } from "../lib/prisma";
export const equipmentService = {
    async createEquipment(data) {
        return prisma.equipment.create({
            data,
        });
    },
    async getEquipmentById(id) {
        return prisma.equipment.findUnique({
            where: {
                id,
            },
        });
    },
    async getAllEquipments(user) {
        const equipment = await prisma.equipment.findMany({
            where: {
                AND: [
                    { company_id: user.companyId },
                ],
            },
            orderBy: {
                name: "asc",
            },
        });
        return equipment;
    },
    async updateEquipment(id, data) {
        return prisma.equipment.update({
            where: {
                id,
            },
            data,
        });
    },
};
