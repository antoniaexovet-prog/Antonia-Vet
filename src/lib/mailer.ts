import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Envía un correo usando SMTP si está configurado. Si no hay configuración SMTP
 * (modo demo / desarrollo), el correo se imprime en la consola del servidor.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
    process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.log("=== [Modo demo] Envío de correo simulado ===");
    console.log(`Para: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.log(html);
    console.log("=============================================");
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
  });

  return { simulated: false };
}
