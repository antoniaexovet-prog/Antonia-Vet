"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCLP } from "@/lib/pricing";

type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  durationMin: number;
};

type Comuna = { id: string; name: string; surcharge: number };

type SpeciesOption = { value: "PERRO" | "GATO" | "OTRO"; label: string; surcharge: number };

type Props = {
  services: Service[];
  comunas: Comuna[];
  species: SpeciesOption[];
};

const TOTAL_STEPS = 4;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function maxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function BookingForm({ services, comunas, species }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [petSpecies, setPetSpecies] = useState<SpeciesOption["value"]>("PERRO");
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [reason, setReason] = useState("");

  // Step 2
  const [comunaId, setComunaId] = useState(comunas[0]?.id ?? "");

  // Step 3
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 4
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedComuna = comunas.find((c) => c.id === comunaId);
  const selectedSpecies = species.find((s) => s.value === petSpecies);

  const total = useMemo(() => {
    return (
      (selectedService?.basePrice ?? 0) +
      (selectedComuna?.surcharge ?? 0) +
      (selectedSpecies?.surcharge ?? 0)
    );
  }, [selectedService, selectedComuna, selectedSpecies]);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      setTime("");
      return;
    }
    setLoadingSlots(true);
    setTime("");
    fetch(`/api/availability?date=${date}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date]);

  function validateStep(currentStep: number): string | null {
    if (currentStep === 1) {
      if (!serviceId) return "Selecciona un servicio";
      if (!petName.trim()) return "Ingresa el nombre de tu mascota";
      if (!petAge.trim()) return "Indica la edad de tu mascota";
      if (!reason.trim()) return "Cuéntanos el motivo de la consulta";
    }
    if (currentStep === 2) {
      if (!comunaId) return "Selecciona tu comuna";
    }
    if (currentStep === 3) {
      if (!date) return "Selecciona una fecha";
      if (!time) return "Selecciona un horario disponible";
    }
    if (currentStep === 4) {
      if (!ownerName.trim()) return "Ingresa tu nombre completo";
      if (!ownerEmail.trim()) return "Ingresa tu correo electrónico";
      if (!ownerPhone.trim()) return "Ingresa tu teléfono de contacto";
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    const validationError = validateStep(4);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          ownerEmail,
          ownerPhone,
          petName,
          species: petSpecies,
          petAge,
          reason,
          serviceId,
          comunaId,
          date,
          time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Ocurrió un error al agendar la hora");
        setSubmitting(false);
        return;
      }

      router.push(`/agendar/pago/${data.appointment.id}`);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Progress */}
        <div className="mb-6 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-lg font-semibold">1. Elige el servicio</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        serviceId === s.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold">{s.name}</p>
                      <p className="mt-1 text-xs text-muted">{s.description}</p>
                      <p className="mt-2 font-bold text-primary">{formatCLP(s.basePrice)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold">2. Cuéntanos sobre tu mascota</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Especie</label>
                    <div className="flex flex-wrap gap-2">
                      {species.map((sp) => (
                        <button
                          key={sp.value}
                          type="button"
                          onClick={() => setPetSpecies(sp.value)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            petSpecies === sp.value
                              ? "border-primary bg-primary text-white"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {sp.label}
                          {sp.surcharge > 0 ? ` (+${formatCLP(sp.surcharge)})` : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="petName">
                      Nombre de tu mascota
                    </label>
                    <input
                      id="petName"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ej: Firulais"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="petAge">
                      Edad
                    </label>
                    <input
                      id="petAge"
                      value={petAge}
                      onChange={(e) => setPetAge(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ej: 3 años"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium" htmlFor="reason">
                      Motivo de la consulta
                    </label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Cuéntanos brevemente qué le pasa a tu mascota"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">3. Selecciona tu comuna</h2>
              <p className="mb-4 text-sm text-muted">
                Atendemos a domicilio en las siguientes comunas. Algunas comunas tienen un recargo
                de traslado.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {comunas.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setComunaId(c.id)}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                      comunaId === c.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-sm text-muted">
                      {c.surcharge > 0 ? `+${formatCLP(c.surcharge)}` : "Sin recargo"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">4. Elige día y hora</h2>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium" htmlFor="date">
                  Fecha
                </label>
                <input
                  id="date"
                  type="date"
                  min={todayStr()}
                  max={maxDateStr()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-muted">Cerrado los días domingo.</p>
              </div>

              {date && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Horarios disponibles</label>
                  {loadingSlots && <p className="text-sm text-muted">Cargando horarios...</p>}
                  {!loadingSlots && slots.length === 0 && (
                    <p className="text-sm text-muted">
                      No hay horarios disponibles para esta fecha. Prueba con otro día.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          time === slot
                            ? "border-primary bg-primary text-white"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">5. Tus datos de contacto</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium" htmlFor="ownerName">
                    Nombre completo
                  </label>
                  <input
                    id="ownerName"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="ownerEmail">
                    Correo electrónico
                  </label>
                  <input
                    id="ownerEmail"
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="ownerPhone">
                    Teléfono
                  </label>
                  <input
                    id="ownerPhone"
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium disabled:opacity-0"
            >
              Volver
            </button>
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? "Reservando..." : "Ir a pagar"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Resumen de tu hora</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Servicio</dt>
              <dd className="text-right font-medium">{selectedService?.name ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Mascota</dt>
              <dd className="text-right font-medium">{petName || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Comuna</dt>
              <dd className="text-right font-medium">{selectedComuna?.name ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Fecha</dt>
              <dd className="text-right font-medium">{date || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Hora</dt>
              <dd className="text-right font-medium">{time || "-"}</dd>
            </div>
          </dl>

          <div className="my-4 border-t border-border" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Tarifa base</dt>
              <dd>{formatCLP(selectedService?.basePrice ?? 0)}</dd>
            </div>
            {(selectedSpecies?.surcharge ?? 0) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Recargo especie</dt>
                <dd>{formatCLP(selectedSpecies?.surcharge ?? 0)}</dd>
              </div>
            )}
            {(selectedComuna?.surcharge ?? 0) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Recargo traslado</dt>
                <dd>{formatCLP(selectedComuna?.surcharge ?? 0)}</dd>
              </div>
            )}
          </dl>

          <div className="my-4 border-t border-border" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCLP(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
