import { sendEmail } from "../services/emailService.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance.js";
import { emailSchema } from "../schemas/emailSchema.js";

export async function emailController(fastify: FastifyTypedInstance) {
  fastify.post(
    "/send-email",
    {
      preHandler: [authMiddleware],
      schema: {
        body: 
          emailSchema
        ,
        description: "Envia um e-mail",
        tags: ["Email"],
      },
    },
    async (request, reply) => {
      const { to, subject, html } = emailSchema.parse(request.body);

      const result = await sendEmail(to, subject, html);

      if (result.success) {
        return reply.status(200).send({ success: true, message: "Sucesso, email enviado!" });
      }
      return reply.status(500).send({ success: false, message: "Erro ao enviar email." });
      
    }
  );
}
