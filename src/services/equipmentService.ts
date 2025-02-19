import { get } from "http";
import { prisma } from "../lib/prisma";

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

async getAllEquipments(): Promise<any> {
  return prisma.equipment.findMany();
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