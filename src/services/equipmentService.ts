import { prisma } from "../lib/prisma";
import { User } from "../entities/user.js";

export const equipmentService = {

async createEquipment(data: any): Promise<any> {
  return prisma.equipment.create({
    data,
  });
},

async getEquipmentById(id: string): Promise<any> {
  return prisma.equipment.findUnique({
    where: {
      id,
    },
  });
},

async getAllEquipments(user: User): Promise<any> {
  const equipment = await prisma.equipment.findMany(
    {
      where: {
        AND: [
          { company_id: user.companyId },
        ],
      },
      orderBy: {
        name: "asc",
      },
    }
  );

  return equipment;
},

async updateEquipment(id: string, data: any): Promise<any> {
  return prisma.equipment.update({
    where: {
      id,
    },
    data,
  });
},

};