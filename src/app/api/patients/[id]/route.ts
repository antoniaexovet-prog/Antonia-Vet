import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/patients/[id]">
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      consultations: { orderBy: { createdAt: "desc" }, include: { appointment: true } },
      appointments: { orderBy: { date: "desc" } },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  species: z.enum(["PERRO", "GATO", "OTRO"]).optional(),
  breed: z.string().trim().nullable().optional(),
  ownerName: z.string().trim().min(1).optional(),
  ownerEmail: z.string().trim().email().optional(),
  ownerPhone: z.string().trim().min(1).optional(),
  photo: z.string().nullable().optional(),
  antecedentes: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/patients/[id]">
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const patient = await prisma.patient.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ patient });
}
