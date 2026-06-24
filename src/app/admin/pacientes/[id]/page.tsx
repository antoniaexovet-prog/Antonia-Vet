import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PatientForm } from "./PatientForm";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export default async function PatientDetailPage({
  params,
}: PageProps<"/admin/pacientes/[id]">) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      consultations: { orderBy: { createdAt: "desc" }, include: { appointment: true } },
      appointments: { orderBy: { date: "desc" }, include: { service: true } },
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pacientes" className="text-sm text-muted hover:text-primary">
          ← Volver a pacientes
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Ficha clínica de {patient.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PatientForm patient={patient} />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Historial de citas</h2>
            {patient.appointments.length === 0 && (
              <p className="text-sm text-muted">Sin citas registradas.</p>
            )}
            <ul className="space-y-3">
              {patient.appointments.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/citas/${a.id}`}
                    className="block rounded-lg border border-border p-3 text-sm hover:border-primary"
                  >
                    <p className="font-medium">
                      {a.date} · {a.time}
                    </p>
                    <p className="text-muted">{a.service.name}</p>
                    <p className="text-xs text-muted">{STATUS_LABEL[a.status]}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Informes enviados</h2>
            {patient.consultations.filter((c) => c.reportSentAt).length === 0 && (
              <p className="text-sm text-muted">Aún no se han enviado informes.</p>
            )}
            <ul className="space-y-3">
              {patient.consultations
                .filter((c) => c.reportSentAt)
                .map((c) => (
                  <li key={c.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium">{c.appointment.date}</p>
                    <p className="text-muted">Enviado a {c.reportSentTo}</p>
                    <p className="text-xs text-muted">
                      {c.reportSentAt &&
                        new Date(c.reportSentAt).toLocaleString("es-CL")}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
