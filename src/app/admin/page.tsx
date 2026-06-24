import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/pricing";
import { SPECIES_LABEL } from "@/lib/pricing";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function shiftDate(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
}

function formatLongDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminDashboard({
  searchParams,
}: PageProps<"/admin">) {
  const params = await searchParams;
  const date = typeof params.date === "string" ? params.date : todayStr();

  const appointments = await prisma.appointment.findMany({
    where: { date, status: { not: "CANCELLED" } },
    include: { service: true, comuna: true, patient: true },
    orderBy: { time: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Calendario de citas</h1>
        <form action="/admin" className="flex items-center gap-2">
          <Link
            href={`/admin?date=${shiftDate(date, -1)}`}
            className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
          >
            ← Anterior
          </Link>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <Link
            href={`/admin?date=${shiftDate(date, 1)}`}
            className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
          >
            Siguiente →
          </Link>
          <Link
            href={`/admin?date=${todayStr()}`}
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Hoy
          </Link>
        </form>
      </div>

      <h2 className="mb-4 text-lg font-medium capitalize text-muted">{formatLongDate(date)}</h2>

      {appointments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          No hay citas agendadas para este día.
        </div>
      )}

      <div className="space-y-3">
        {appointments.map((a) => (
          <Link
            key={a.id}
            href={`/admin/citas/${a.id}`}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="text-lg font-bold text-primary">{a.time}</div>
              <div>
                <p className="font-semibold">
                  {a.petName} · {SPECIES_LABEL[a.species]}
                </p>
                <p className="text-sm text-muted">
                  {a.ownerName} · {a.service.name} · {a.comuna.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatCLP(a.totalPrice)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[a.status]}`}>
                {STATUS_LABEL[a.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
