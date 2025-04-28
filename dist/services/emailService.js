import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendEmail(to, subject, html) {
    try {
        const response = await resend.emails.send({
            from: 'obrafacil@obrafacilapp.com',
            to,
            subject,
            html,
        });
        return { success: true, data: response };
    }
    catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        return { success: false, error: 'Falha ao enviar e-mail' };
    }
}
