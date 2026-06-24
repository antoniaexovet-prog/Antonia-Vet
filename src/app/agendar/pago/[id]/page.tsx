import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/pricing";
import { PayButton } from "./PayButton";

export default async function PagoPage({
  params,
}: PageProps<"/agendar/pago/[id]">) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true, comuna: true },
  });

  if (!appointment) {
    notFound();
  }

  if (appointment.status !== "PENDING_PAYMENT") {
    redirect(`/agendar/confirmacion/${appointment.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Confirma y paga tu hora</h1>
      <p className="mb-8 text-muted">
        Revisa el detalle de tu reserva. Al confirmar el pago, tu hora quedará agendada y la
        recibiremos en nuestro calendario.
      </p>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Detalle de la cita</h2>
        <dl className="space-y-2 text-sm">
          <Row label="Servicio" value={appointment.service.name} />
          <Row label="Mascota" value={`${appointment.petName} (${appointment.species})`} />
          <Row label="Motivo" value={appointment.reason} />
          <Row label="Comuna" value={appointment.comuna.name} />
          <Row label="Fecha" value={appointment.date} />
          <Row label="Hora" value={appointment.time} />
          <Row label="Tutor/a" value={appointment.ownerName} />
          <Row label="Correo" value={appointment.ownerEmail} />
          <Row label="Teléfono" value={appointment.ownerPhone} />
        </dl>

        <div className="my-4 border-t border-border" />

        <div className="flex justify-between text-lg font-bold">
          <span>Total a pagar</span>
          <span className="text-primary">{formatCLP(appointment.totalPrice)}</span>
        </div>

        <div className="mt-6">
          <PayButton appointmentId={appointment.id} />
          <p className="mt-3 text-center text-xs text-muted">
            Pago simulado mediante Webpay Plus (modo demo). No se realizará ningún cargo real.
          </p>
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
