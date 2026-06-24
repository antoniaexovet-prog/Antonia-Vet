"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Patient } from "@/generated/prisma/client";
import { SPECIES_LABEL } from "@/lib/pricing";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

export function PatientForm({ patient }: { patient: Patient }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(patient.name);
  const [species, setSpecies] = useState(patient.species);
  const [breed, setBreed] = useState(patient.breed ?? "");
  const [ownerName, setOwnerName] = useState(patient.ownerName);
  const [ownerEmail, setOwnerEmail] = useState(patient.ownerEmail);
  const [ownerPhone, setOwnerPhone] = useState(patient.ownerPhone);
  const [antecedentes, setAntecedentes] = useState(patient.antecedentes ?? "");
  const [photo, setPhoto] = useState<string | null>(patient.photo);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE) {
      setError("La foto debe pesar menos de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch(`/api/patients/${patient.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        species,
        breed: breed || null,
        ownerName,
        ownerEmail,
        ownerPhone,
        antecedentes: antecedentes || null,
        photo,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar la ficha");
      return;
    }

    setMessage("Ficha guardada correctamente.");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} className="h-full w-full object-cover" />
          ) : (
            "🐾"
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
          >
            Cambiar foto
          </button>
          {photo && (
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="ml-2 rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-red-300 hover:text-red-500"
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre de la mascota">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>
        <Field label="Especie">
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value as Patient["species"])}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          >
            {Object.entries(SPECIES_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Raza">
          <input
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>
        <Field label="Tutor/a">
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>
        <Field label="Correo del tutor">
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>
        <Field label="Teléfono del tutor">
          <input
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Antecedentes médicos">
            <textarea
              rows={4}
              value={antecedentes}
              onChange={(e) => setAntecedentes(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enfermedades previas, alergias, cirugías, vacunas, etc."
            />
          </Field>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar ficha"}
        </button>
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
