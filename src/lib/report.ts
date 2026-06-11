import { SPECIES_LABEL } from "@/lib/pricing";
import type { Appointment, Consultation, Patient, Service } from "@/generated/prisma/client";

type ReportInput = {
  appointment: Appointment & { service: Service };
  patient: Patient;
  consultation: Consultation;
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Genera el contenido HTML del informe de consulta enviado al tutor. */
export function generateReportHtml({ appointment, patient, consultation }: ReportInput): string {
  const vitals: string[] = [];
  if (consultation.temperature != null) vitals.push(`<li>Temperatura: ${consultation.temperature} °C</li>`);
  if (consultation.weight != null) vitals.push(`<li>Peso: ${consultation.weight} kg</li>`);
  if (consultation.heartRate != null) vitals.push(`<li>Frecuencia cardíaca: ${consultation.heartRate} lpm</li>`);
  if (consultation.respRate != null) vitals.push(`<li>Frecuencia respiratoria: ${consultation.respRate} rpm</li>`);

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2933; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2f6f4f;">Antonia Vet</h1>
      <h2>Informe de consulta</h2>
      <p><strong>Fecha:</strong> ${formatDate(appointment.date)} a las ${appointment.time}</p>
      <p><strong>Paciente:</strong> ${patient.name} (${SPECIES_LABEL[patient.species]}${patient.breed ? `, ${patient.breed}` : ""})</p>
      <p><strong>Tutor/a:</strong> ${appointment.ownerName}</p>
      <p><strong>Servicio:</strong> ${appointment.service.name}</p>
      <p><strong>Motivo de consulta:</strong> ${appointment.reason}</p>

      ${vitals.length ? `<h3>Constantes vitales</h3><ul>${vitals.join("")}</ul>` : ""}

      ${consultation.notes ? `<h3>Observaciones de la consulta</h3><p>${consultation.notes.replace(/\n/g, "<br/>")}</p>` : ""}

      ${consultation.diagnosis ? `<h3>Diagnóstico</h3><p>${consultation.diagnosis.replace(/\n/g, "<br/>")}</p>` : ""}

      ${consultation.indications ? `<h3>Indicaciones</h3><p>${consultation.indications.replace(/\n/g, "<br/>")}</p>` : ""}

      <hr style="margin-top: 24px; border: none; border-top: 1px solid #e0e0e0;" />
      <p style="font-size: 12px; color: #6b7280;">Este informe fue generado automáticamente por Antonia Vet tras la consulta de ${patient.name}.</p>
    </div>
  `;
}
