"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AppointmentStatusControls({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    if (newStatus === "CANCELLED" && !confirm("¿Cancelar esta cita?")) return;

    setLoading(true);
    await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status === "CANCELLED" || status === "COMPLETED") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-3 font-semibold">Acciones</h2>
      <button
        type="button"
        disabled={loading}
        onClick={() => updateStatus("CANCELLED")}
        className="w-full rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        Cancelar cita
      </button>
    </div>
  );
}
