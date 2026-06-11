"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Consultation } from "@/generated/prisma/client";

type Props = {
  appointmentId: string;
  initialConsultation: Consultation | null;
  ownerEmail: string;
  reportSentAt: string | null;
  reportSentTo: string | null;
};

export function ConsultationForm({
  appointmentId,
  initialConsultation,
  ownerEmail,
  reportSentAt,
  reportSentTo,
}: Props) {
  const router = useRouter();

  const [temperature, setTemperature] = useState(
    initialConsultation?.temperature?.toString() ?? ""
  );
  const [weight, setWeight] = useState(initialConsultation?.weight?.toString() ?? "");
  const [heartRate, setHeartRate] = useState(initialConsultation?.heartRate?.toString() ?? "");
  const [respRate, setRespRate] = useState(initialConsultation?.respRate?.toString() ?? "");
  const [notes, setNotes] = useState(initialConsultation?.notes ?? "");
  const [diagnosis, setDiagnosis] = useState(initialConsultation?.diagnosis ?? "");
  const [indications, setIndications] = useState(initialConsultation?.indications ?? "");

  const [reportEmail, setReportEmail] = useState(reportSentTo ?? ownerEmail);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentInfo, setSentInfo] = useState<{ at: string; to: string } | null>(
    reportSentAt && reportSentTo ? { at: reportSentAt, to: reportSentTo } : null
  );
  const [error, setError] = useState<string | null>(null);

  function toNumberOrNull(value: string): number | null {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedMessage(null);

    const res = await fetch(`/api/consultations/${appointmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature: toNumberOrNull(temperature),
        weight: toNumberOrNull(weight),
        heartRate: toNumberOrNull(heartRate),
        respRate: toNumberOrNull(respRate),
        notes: notes || null,
        diagnosis: diagnosis || null,
        indications: indications || null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar la ficha de consulta");
      return;
    }

    setSavedMessage("Ficha de consulta guardada.");
  }

  async function handleSendReport() {
    setSending(true);
    setError(null);

    // Aseguramos guardar los últimos cambios antes de generar el informe
    await fetch(`/api/consultations/${appointmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature: toNumberOrNull(temperature),
        weight: toNumberOrNull(weight),
        heartRate: toNumberOrNull(heartRate),
        respRate: toNumberOrNull(respRate),
        notes: notes || null,
        diagnosis: diagnosis || null,
        indications: indications || null,
      }),
    });

    const res = await fetch(`/api/consultations/${appointmentId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: reportEmail }),
    });

    const data = await res.json().catch(() => ({}));
    setSending(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar el informe");
      return;
    }

    setSentInfo({ at: new Date().toISOString(), to: reportEmail });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Constantes vitales</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Temperatura (°C)">
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="Peso (kg)">
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="Frec. cardíaca (lpm)">
            <input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="Frec. respiratoria (rpm)">
            <input
              type="number"
              value={respRate}
              onChange={(e) => setRespRate(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Evaluación clínica</h2>
        <div className="space-y-4">
          <Field label="Observaciones de la consulta">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Lo conversado y observado durante la consulta..."
            />
          </Field>
          <Field label="Diagnóstico">
            <textarea
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <Field label="Indicaciones para el tutor">
            <textarea
              rows={3}
              value={indications}
              onChange={(e) => setIndications(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tratamiento, dosis, próximos controles..."
            />
          </Field>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {savedMessage && (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {savedMessage}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar ficha"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-2 font-semibold">Informe de consulta</h2>
        <p className="mb-4 text-sm text-muted">
          Genera un resumen de la consulta y envíalo por correo al tutor.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={reportEmail}
            onChange={(e) => setReportEmail(e.target.value)}
            className="flex-1 rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleSendReport}
            disabled={sending}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Generar y enviar informe"}
          </button>
        </div>
        {sentInfo && (
          <p className="mt-3 text-sm text-green-700">
            Informe enviado a {sentInfo.to} el{" "}
            {new Date(sentInfo.at).toLocaleString("es-CL")}.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
