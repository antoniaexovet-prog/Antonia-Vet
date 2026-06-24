import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/pricing";

export default async function ConfirmacionPage({
  params,
}: PageProps<"/agendar/confirmacion/[id]">) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true, comuna: true },
  });

  if (!appointment) {
    notFound();
  }

  if (appointment.status === "PENDING_PAYMENT") {
    redirect(`/agendar/pago/${appointment.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="mb-2 text-2xl font-bold">¡Tu hora está confirmada!</h1>
        <p className="mb-6 text-muted">
          Hemos enviado los detalles a {appointment.ownerEmail}. Te esperamos en la fecha
          indicada.
        </p>

        <dl className="space-y-2 text-left text-sm">
          <Row label="Código de pago" value={appointment.paymentRef ?? "-"} />
          <Row label="Servicio" value={appointment.service.name} />
          <Row label="Mascota" value={appointment.petName} />
          <Row label="Comuna" value={appointment.comuna.name} />
          <Row label="Fecha" value={appointment.date} />
          <Row label="Hora" value={appointment.time} />
          <Row label="Total pagado" value={formatCLP(appointment.totalPrice)} />
        </dl>

        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
