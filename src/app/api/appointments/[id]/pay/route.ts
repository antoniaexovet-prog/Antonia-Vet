import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

/**
 * Simula la confirmación de pago de Webpay Plus (Transbank).
 * En producción, este endpoint sería reemplazado por la confirmación
 * real del SDK de Transbank (transacción "commit") y debería validar
 * el resultado antes de confirmar la cita.
 */
export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]/pay">
) {
  const { id } = await ctx.params;

  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  }

  if (appointment.status !== "PENDING_PAYMENT") {
    return NextResponse.json(
      { error: "Esta cita ya fue procesada" },
      { status: 409 }
    );
  }

  // Busca o crea la ficha clínica del paciente
  let patient = await prisma.patient.findFirst({
    where: { ownerEmail: appointment.ownerEmail, name: appointment.petName },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        name: appointment.petName,
        species: appointment.species,
        ownerName: appointment.ownerName,
        ownerEmail: appointment.ownerEmail,
        ownerPhone: appointment.ownerPhone,
      },
    });
  }

  const paymentRef = `WP-${uuidv4().slice(0, 8).toUpperCase()}`;

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      paymentRef,
      patientId: patient.id,
    },
    include: { service: true, comuna: true, patient: true },
  });

  return NextResponse.json({ appointment: updated });
}
