import fastify from "fastify";
import fastifyJWT from "fastify-jwt";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import routes from "./routes.js";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

const server = fastify().withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Registre o CORS no servidor
server.register(cors, {
  origin: ["http://localhost:3000", "http://localhost:8081"], // Domínio do frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
  credentials: true, // Para permitir cookies, se necessário
});

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "ObraFácil API",
      description: "API documentation",
      version: "1.0.0",
    },
    components: {
      schemas: {
        SubscriptionPlan: {
          type: "string",
          enum: ["free", "basic", "premium"],
        },
        Role: {
          type: "string",
          enum: ["admin", "team", "client"],
        },
        UserType: {
          type: "string",
          enum: ["person", "business"],
        },
        ProjectStatus: {
          type: "string",
          enum: [
            "nao_iniciado",
            "em_andamento",
            "concluido",
            "cancelado",
            "em_espera",
          ],
        },
        EmployeeStatus: {
          type: "string",
          enum: ["ativo", "inativo"],
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  transform: jsonSchemaTransform,
});

server.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

server.register(fastifyJWT, {
  secret: process.env.JWT_SECRET || "mysecretkey",
});

server.register(routes);

server.setErrorHandler(errorHandler);

server.listen({ port: process.env.PORT ? Number(process.env.PORT) : 5000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log("Servidor rodando");
});
