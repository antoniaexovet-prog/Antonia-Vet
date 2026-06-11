import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/pricing";

export default async function Home() {
  const [services, comunas] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } }),
    prisma.comuna.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            Atención veterinaria a domicilio
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Cuidamos a tu mascota en la comodidad de tu hogar
          </h1>
          <p className="max-w-2xl text-lg text-muted">
            Agenda tu hora médica en minutos: elige el servicio, la fecha, la hora y tu comuna.
            Te confirmamos al instante y dejamos todo registrado para tu próxima visita.
          </p>
          <Link
            href="/agendar"
            className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-primary-dark"
          >
            Agendar hora ahora
          </Link>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-10 text-center text-3xl font-bold">¿Cómo funciona?</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Elige día, hora y comuna",
              text: "Selecciona el servicio que necesita tu mascota y el horario que más te acomode.",
            },
            {
              step: "2",
              title: "Cuéntanos sobre tu mascota",
              text: "Indícanos su nombre, especie, edad y el motivo de la consulta.",
            },
            {
              step: "3",
              title: "Confirma y paga en línea",
              text: "Revisa el valor total, paga de forma segura y recibe la confirmación de tu hora.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="bg-card/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">Nuestros servicios</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="mb-2 text-lg font-semibold">{service.name}</h3>
                <p className="mb-4 flex-1 text-sm text-muted">{service.description}</p>
                <p className="text-xl font-bold text-primary">
                  Desde {formatCLP(service.basePrice)}
                </p>
                <p className="text-xs text-muted">{service.durationMin} min aprox.</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            El valor final puede variar según la especie de tu mascota y tu comuna.
          </p>
        </div>
      </section>

      {/* Comunas */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-6 text-center text-3xl font-bold">Comunas con atención a domicilio</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {comunas.map((comuna) => (
            <span
              key={comuna.id}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              {comuna.name}
            </span>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="mb-4 text-3xl font-bold">¿Listo para agendar?</h2>
          <p className="mb-8 text-primary-foreground/90">
            En menos de 5 minutos puedes reservar la hora médica para tu mascota.
          </p>
          <Link
            href="/agendar"
            className="inline-block rounded-full bg-white px-8 py-3 text-lg font-semibold text-primary shadow-md transition hover:bg-white/90"
          >
            Agendar hora
          </Link>
        </div>
      </section>
    </div>
  );
}
