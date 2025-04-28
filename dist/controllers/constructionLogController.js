import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { authMiddleware } from "../middlewares/authMiddleware";
import { ConstructionLogResponseSchema, constructionLogSchema, getConstructionLogByIdQuerySchema, getConstructionLogQuerySchema, getConstructionLogResponseSchema, updateLogSchema, } from "../schemas/constrructionLogSchema";
import { ConstructionLogService } from "../services/constructionLogService";
export async function constructionLogController(server) {
    server.post("/construction-log", {
        preHandler: [authMiddleware],
        schema: {
            body: constructionLogSchema,
            response: {
                201: ConstructionLogResponseSchema,
            },
            tags: ["Diário de Obra"],
            description: "Cria um novo diário de obra",
        },
    }, async (request, reply) => {
        const user = request.user;
        if (!user) {
            throw new UnauthorizedError("Usuário não autenticado.");
        }
        const body = constructionLogSchema.parse(request.body);
        const newConstructionLog = await ConstructionLogService.createContructionLog({
            date: body.date,
            project_id: body.project_id,
            tasks: body.tasks ?? undefined,
            comments: body.comments ?? undefined,
            weathers: body.weathers,
            occurrences: body.occurrences?.map((occurrence) => ({
                ...occurrence,
                employee_id: occurrence.employee_id ?? undefined,
            })),
            services: body.services,
            employees: body.employees,
            equipment_usage: body.equipment_usage,
        });
        const constructionLogResponse = ConstructionLogResponseSchema.parse(newConstructionLog);
        return reply.status(201).send(constructionLogResponse);
    });
    server.get("/construction-log", {
        preHandler: [authMiddleware],
        schema: {
            querystring: getConstructionLogQuerySchema,
            response: {
                200: getConstructionLogResponseSchema.array(),
            },
            tags: ["Diário de Obra"],
            description: "Retorna os diários de uma obra específica",
        },
    }, async (request, reply) => {
        const user = request.user;
        const { project_id, start_date, end_date } = request.query;
        if (!user) {
            throw new UnauthorizedError("Usuário não autenticado.");
        }
        if (!project_id) {
            throw new BadRequestError("O ID do projeto é obrigatório.");
        }
        const constructionLogs = await ConstructionLogService.getAllConstructionLogs(project_id, user.userId, start_date, end_date);
        const validatedLogs = constructionLogs.map(log => getConstructionLogResponseSchema.parse(log));
        return reply.status(200).send(validatedLogs);
    });
    server.get("/construction-log/:id", {
        preHandler: [authMiddleware],
        schema: {
            querystring: getConstructionLogByIdQuerySchema,
            response: {
                200: ConstructionLogResponseSchema,
            },
            tags: ["Diário de Obra"],
            description: "Retorna um diário de obra",
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { date } = request.query;
        const constructionLog = await ConstructionLogService.getConstructionLogById(id, date ? new Date(date) : undefined);
        const constructionLogResponse = ConstructionLogResponseSchema.parse(constructionLog);
        return reply.status(200).send(constructionLogResponse);
    });
    server.put("/construction-log/:id", {
        preHandler: [authMiddleware],
        schema: {
            body: updateLogSchema,
            response: {
                200: ConstructionLogResponseSchema,
            },
            tags: ["Diário de Obra"],
            description: "Atualiza um diário de obra",
        },
    }, async (request, reply) => {
        const user = request.user;
        const { id } = request.params;
        if (!user) {
            throw new UnauthorizedError("Usuário não autenticado.");
        }
        const body = updateLogSchema.parse(request.body);
        const updatedConstructionLog = await ConstructionLogService.updateConstructionLog(id, {
            ...body,
        });
        const constructionLogResponse = ConstructionLogResponseSchema.parse(updatedConstructionLog);
        return reply.status(200).send(constructionLogResponse);
    });
}
