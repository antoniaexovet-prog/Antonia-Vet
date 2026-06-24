import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SPECIES_LABEL, SPECIES_SURCHARGE } from "@/lib/pricing";

export async function GET() {
  const [services, comunas] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { basePrice: "asc" },
    }),
    prisma.comuna.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const species = Object.entries(SPECIES_LABEL).map(([value, label]) => ({
    value,
    label,
    surcharge: SPECIES_SURCHARGE[value as keyof typeof SPECIES_SURCHARGE],
  }));

  return NextResponse.json({ services, comunas, species });
}
