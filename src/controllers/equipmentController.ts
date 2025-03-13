import { User } from "../entities/user";
import { UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware } from "../middlewares/authMiddleware";
import { equipmentResponseSchema, equipmentSchema } from "../schemas/equipmentSchema";
import { equipmentService } from "../services/equipmentService";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";

export async function equipmentController(server: FastifyTypedInstance) {
  server.post(
    "/equipment",
    {
      preHandler: [authMiddleware],
      schema: {
        body: equipmentSchema,
        response: {
          201: equipmentResponseSchema,
        },
        tags: ["Equipamentos"],
        description: "Cria um novo equipamento",
      },
    },
    async (request, reply) => {

      const body = equipmentSchema.parse(request.body);

      const newEquipment = await equipmentService.createEquipment({
        ...body,
      });

      const equipmentResponse = equipmentResponseSchema.parse(newEquipment);

      return reply.status(201).send(equipmentResponse);
    }
  );

  server.get(
    "/equipments",
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: equipmentResponseSchema.array(),
        },
        tags: ["Equipamentos"],
        description: "Retorna todos os equipamentos",
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }   

      const equipments = await equipmentService.getAllEquipments(user);

      const equipmentResponse = equipmentResponseSchema.array().parse(equipments);  

      return reply.status(200).send(equipmentResponse);
    }
  );

  server.get<{Params: { id: string }}>(
    "/equipment/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: equipmentResponseSchema,
        },
        tags: ["Equipamentos"],
        description: "Retorna um equipamento pelo ID",
      },
    },
    async (request, reply) => {
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado.");
      }

      const { id } = request.params;

      const equipment = await equipmentService.getEquipmentById(id);

      if (!equipment) {
        throw new UnauthorizedError("Equipamento não encontrado.");
      } 

      const equipmentResponse = equipmentResponseSchema.parse(equipment);  

      return reply.status(200).send(equipmentResponse);
    }
  );

  server.put<{Params: { id: string }}>(
    "/equipment/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        body: equipmentSchema,
        response: {
          200: equipmentResponseSchema,
        },
        tags: ["Equipamentos"],
        description: "Atualiza um equipamento pelo ID",
      },
    },
    async (request, reply) => {

      const { id } = request.params;
      const body = equipmentSchema.parse(request.body);

      const updatedEquipment = await equipmentService.updateEquipment(id, body);

      if (!updatedEquipment) {
        throw new UnauthorizedError("Equipamento não encontrado.");
      } 

      const equipmentResponse = equipmentResponseSchema.parse(updatedEquipment);  

      return reply.status(200).send(equipmentResponse);
    }
  );
}