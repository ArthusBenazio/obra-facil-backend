import { sendEmail } from "../services/emailService";
import { authMiddleware } from "../middlewares/authMiddleware";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";
import { emailSchema } from "../schemas/emailSchema";

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

      console.log("Recebendo solicitação de envio de e-mail:", { to, subject, html });

      const result = await sendEmail(to, subject, html);

      console.log("Resultado do envio de e-mail:", result);

      if (result.success) {
        return reply.status(200).send({ success: true, message: "Sucesso, email enviado!" });
      }
      return reply.status(500).send({ success: false, message: "Erro ao enviar email." });
      
    }
  );
}
