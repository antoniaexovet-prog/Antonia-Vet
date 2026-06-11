import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCLP, SPECIES_LABEL } from "@/lib/pricing";
import { ConsultationForm } from "./ConsultationForm";
import { AppointmentStatusControls } from "./AppointmentStatusControls";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export default async function CitaDetailPage({
  params,
}: PageProps<"/admin/citas/[id]">) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      service: true,
      comuna: true,
      patient: true,
      consultation: true,
    },
  });

  if (!appointment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted hover:text-primary">
            ← Volver al calendario
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {appointment.petName} — {appointment.date} {appointment.time}
          </h1>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {STATUS_LABEL[appointment.status]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Detalle de la cita</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Servicio" value={appointment.service.name} />
              <Row label="Comuna" value={appointment.comuna.name} />
              <Row label="Especie" value={SPECIES_LABEL[appointment.species]} />
              <Row label="Edad" value={appointment.petAge} />
              <Row label="Motivo" value={appointment.reason} />
              <Row label="Total" value={formatCLP(appointment.totalPrice)} />
              {appointment.paymentRef && <Row label="Pago" value={appointment.paymentRef} />}
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Tutor/a</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Nombre" value={appointment.ownerName} />
              <Row label="Correo" value={appointment.ownerEmail} />
              <Row label="Teléfono" value={appointment.ownerPhone} />
            </dl>
            {appointment.patient && (
              <Link
                href={`/admin/pacientes/${appointment.patient.id}`}
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Ver ficha clínica de {appointment.patient.name} →
              </Link>
            )}
          </div>

          <AppointmentStatusControls
            appointmentId={appointment.id}
            status={appointment.status}
          />
        </div>

        <div className="lg:col-span-2">
          {appointment.patientId ? (
            <ConsultationForm
              appointmentId={appointment.id}
              initialConsultation={appointment.consultation}
              ownerEmail={appointment.ownerEmail}
              reportSentAt={appointment.consultation?.reportSentAt?.toISOString() ?? null}
              reportSentTo={appointment.consultation?.reportSentTo ?? null}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              Esta cita aún no tiene un paciente asociado. La ficha se vincula automáticamente
              cuando el tutor confirma el pago.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
