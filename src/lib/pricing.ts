import { Species } from "@/generated/prisma/enums";

/** Recargo aplicado según la especie del paciente (mascotas exóticas requieren más tiempo/equipo). */
export const SPECIES_SURCHARGE: Record<Species, number> = {
  PERRO: 0,
  GATO: 0,
  OTRO: 8000,
};

export const SPECIES_LABEL: Record<Species, string> = {
  PERRO: "Perro",
  GATO: "Gato",
  OTRO: "Otra especie / exótico",
};

export function speciesSurcharge(species: Species): number {
  return SPECIES_SURCHARGE[species] ?? 0;
}

export function calculateTotal(
  servicePrice: number,
  comunaSurcharge: number,
  species: Species
): number {
  return servicePrice + comunaSurcharge + speciesSurcharge(species);
}

export function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}
