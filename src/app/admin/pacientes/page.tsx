import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SPECIES_LABEL } from "@/lib/pricing";

export default async function PacientesPage({
  searchParams,
}: PageProps<"/admin/pacientes">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { ownerName: { contains: q } },
            { ownerEmail: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Fichas de pacientes</h1>
        <form action="/admin/pacientes" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por mascota o tutor..."
            className="w-64 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Buscar
          </button>
        </form>
      </div>

      {patients.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          No se encontraron pacientes.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patients.map((p) => (
          <Link
            key={p.id}
            href={`/admin/pacientes/${p.id}`}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-2xl">
              {p.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                "🐾"
              )}
            </div>
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-muted">
                {SPECIES_LABEL[p.species]}
                {p.breed ? ` · ${p.breed}` : ""}
              </p>
              <p className="text-sm text-muted">{p.ownerName}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
