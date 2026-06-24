import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Species } from "@/generated/prisma/enums";
import { calculateTotal, speciesSurcharge } from "@/lib/pricing";
import { availableSlotsForDate } from "@/lib/availability";
import { getSession } from "@/lib/auth";

const createAppointmentSchema = z.object({
  ownerName: z.string().trim().min(2, "Ingresa tu nombre completo"),
  ownerEmail: z.string().trim().email("Correo inválido"),
  ownerPhone: z.string().trim().min(6, "Teléfono inválido"),
  petName: z.string().trim().min(1, "Ingresa el nombre de tu mascota"),
  species: z.nativeEnum(Species),
  petAge: z.string().trim().min(1, "Indica la edad de tu mascota"),
  reason: z.string().trim().min(3, "Cuéntanos brevemente el motivo"),
  serviceId: z.string().min(1),
  comunaId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");

  const appointments = await prisma.appointment.findMany({
    where: date ? { date } : undefined,
    include: { service: true, comuna: true, patient: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json({ appointments });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const [service, comuna] = await Promise.all([
    prisma.service.findUnique({ where: { id: data.serviceId } }),
    prisma.comuna.findUnique({ where: { id: data.comunaId } }),
  ]);

  if (!service || !service.active) {
    return NextResponse.json(
      { error: "El servicio seleccionado no está disponible" },
      { status: 400 }
    );
  }
  if (!comuna || !comuna.active) {
    return NextResponse.json(
      { error: "La comuna seleccionada no está disponible" },
      { status: 400 }
    );
  }

  const slots = await availableSlotsForDate(data.date);
  if (!slots.includes(data.time)) {
    return NextResponse.json(
      { error: "El horario seleccionado ya no está disponible" },
      { status: 409 }
    );
  }

  const totalPrice = calculateTotal(service.basePrice, comuna.surcharge, data.species);

  const appointment = await prisma.appointment.create({
    data: {
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      petName: data.petName,
      species: data.species,
      petAge: data.petAge,
      reason: data.reason,
      serviceId: data.serviceId,
      comunaId: data.comunaId,
      speciesSurcharge: speciesSurcharge(data.species),
      totalPrice,
      date: data.date,
      time: data.time,
      status: "PENDING_PAYMENT",
    },
    include: { service: true, comuna: true },
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
