import { prisma } from "@/lib/prisma";
import { SPECIES_LABEL, SPECIES_SURCHARGE } from "@/lib/pricing";
import { BookingForm } from "./BookingForm";

export default async function AgendarPage() {
  const [services, comunas] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } }),
    prisma.comuna.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const species = (Object.keys(SPECIES_LABEL) as Array<keyof typeof SPECIES_LABEL>).map(
    (value) => ({
      value,
      label: SPECIES_LABEL[value],
      surcharge: SPECIES_SURCHARGE[value],
    })
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Agenda tu hora médica</h1>
      <p className="mb-8 text-muted">
        Completa los siguientes pasos. El valor se actualizará automáticamente según tu selección.
      </p>
      <BookingForm
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          basePrice: s.basePrice,
          durationMin: s.durationMin,
        }))}
        comunas={comunas.map((c) => ({ id: c.id, name: c.name, surcharge: c.surcharge }))}
        species={species}
      />
    </div>
  );
}
