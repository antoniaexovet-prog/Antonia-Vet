import { prisma } from "@/lib/prisma";

export const BUSINESS_HOURS = {
  start: 9, // 09:00
  end: 19, // último bloque empieza a las 18:00
  lunchStart: 13,
  lunchEnd: 14,
};

export const SLOT_MINUTES = 60;

/** Genera todos los horarios posibles de atención en un día (sin filtrar disponibilidad). */
export function allDaySlots(): string[] {
  const slots: string[] = [];
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    if (hour >= BUSINESS_HOURS.lunchStart && hour < BUSINESS_HOURS.lunchEnd) {
      continue;
    }
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

/** Días de la semana en que se atiende (0 = domingo ... 6 = sábado). Cerrado los domingos. */
export function isOpenOnDate(date: Date): boolean {
  return date.getDay() !== 0;
}

/** Devuelve los horarios disponibles para una fecha (YYYY-MM-DD), excluyendo los ya reservados. */
export async function availableSlotsForDate(date: string): Promise<string[]> {
  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(year, (month ?? 1) - 1, day ?? 1);

  if (!isOpenOnDate(parsedDate)) {
    return [];
  }

  const booked = await prisma.appointment.findMany({
    where: {
      date,
      status: { in: ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED"] },
    },
    select: { time: true },
  });
  const bookedTimes = new Set(booked.map((b) => b.time));

  const today = new Date();
  const isToday =
    parsedDate.getFullYear() === today.getFullYear() &&
    parsedDate.getMonth() === today.getMonth() &&
    parsedDate.getDate() === today.getDate();

  return allDaySlots().filter((slot) => {
    if (bookedTimes.has(slot)) return false;
    if (isToday) {
      const [hour] = slot.split(":").map(Number);
      if (hour <= today.getHours()) return false;
    }
    return true;
  });
}
