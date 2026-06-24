"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/pay`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar el pago");
        setLoading(false);
        return;
      }

      router.push(`/agendar/confirmacion/${appointmentId}`);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e2231a] px-6 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Procesando pago..." : "Pagar con Webpay"}
      </button>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
