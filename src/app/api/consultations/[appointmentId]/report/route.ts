import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateReportHtml } from "@/lib/report";
import { sendEmail } from "@/lib/mailer";

const sendSchema = z.object({
  email: z.string().trim().email().optional(),
});

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/consultations/[appointmentId]/report">
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { appointmentId } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true, patient: true, consultation: true },
  });

  if (!appointment || !appointment.patient || !appointment.consultation) {
    return NextResponse.json(
      { error: "Falta completar la ficha de la consulta antes de generar el informe" },
      { status: 400 }
    );
  }

  const recipient = parsed.data.email || appointment.ownerEmail;

  const html = generateReportHtml({
    appointment,
    patient: appointment.patient,
    consultation: appointment.consultation,
  });

  await sendEmail({
    to: recipient,
    subject: `Informe de consulta - ${appointment.patient.name} - Antonia Vet`,
    html,
  });

  const consultation = await prisma.consultation.update({
    where: { appointmentId },
    data: {
      reportContent: html,
      reportSentAt: new Date(),
      reportSentTo: recipient,
    },
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json({ consultation });
}
