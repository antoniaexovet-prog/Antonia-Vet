import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const upsertSchema = z.object({
  temperature: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  heartRate: z.number().int().nullable().optional(),
  respRate: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  indications: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/consultations/[appointmentId]">
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { appointmentId } = await ctx.params;

  const consultation = await prisma.consultation.findUnique({
    where: { appointmentId },
  });

  return NextResponse.json({ consultation });
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/consultations/[appointmentId]">
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { appointmentId } = await ctx.params;
  const body = await request.json();
  const parsed = upsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  }

  if (!appointment.patientId) {
    return NextResponse.json(
      { error: "La cita no tiene un paciente asociado" },
      { status: 400 }
    );
  }

  const consultation = await prisma.consultation.upsert({
    where: { appointmentId },
    update: parsed.data,
    create: {
      appointmentId,
      patientId: appointment.patientId,
      ...parsed.data,
    },
  });

  return NextResponse.json({ consultation });
}
