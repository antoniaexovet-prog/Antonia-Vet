# Antonia Vet

Plataforma de agendamiento de horas veterinarias a domicilio, con panel de
administración para gestionar el calendario, fichas clínicas de pacientes y
envío de informes de consulta por correo.

## Funcionalidades

### Sitio público
- Landing page con servicios, comunas atendidas y llamada a la acción.
- `/agendar`: flujo de reserva paso a paso (servicio, mascota, comuna, fecha/hora,
  datos de contacto) con cálculo de tarifa en tiempo real según el servicio,
  la especie de la mascota y la comuna.
- `/agendar/pago/[id]`: confirmación de la reserva y pago (simulación de
  Webpay Plus / Transbank).
- `/agendar/confirmacion/[id]`: confirmación final de la hora agendada.

### Panel de administración (`/admin`)
- Login protegido (`/admin/login`).
- Calendario/agenda diaria de citas con navegación por fecha.
- Ficha de cada cita: datos del tutor, registro de constantes vitales
  (temperatura, peso, frecuencia cardíaca y respiratoria), observaciones,
  diagnóstico e indicaciones.
- Generación y envío por correo de un informe de consulta al tutor.
- Fichas clínicas de pacientes con foto, especie, raza, antecedentes médicos
  e historial de citas e informes enviados.

## Stack técnico
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + SQLite (`better-sqlite3` driver adapter)
- Sesión de administrador con cookies firmadas (JWT vía `jose`)
- Envío de correos con `nodemailer` (modo demo: si no hay SMTP configurado,
  los correos se imprimen en la consola del servidor)

## Primeros pasos

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` a `.env` y ajusta las variables (credenciales de
   administrador, secreto de sesión y, opcionalmente, SMTP).
3. Aplica las migraciones y carga los datos iniciales (servicios, comunas y
   usuario administrador):
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Accede al panel en `/admin/login` con las credenciales definidas en
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` (por defecto
   `admin@antoniavet.cl` / `antoniavet2024`).

## Próximos pasos para producción
- Reemplazar el endpoint de pago simulado (`/api/appointments/[id]/pay`) por
  la integración real con Webpay Plus (Transbank) u otra pasarela.
- Conectar el calendario con Google Calendar (OAuth) para sincronizar las
  citas confirmadas con el calendario personal de la veterinaria.
- Migrar la base de datos a Postgres (o similar) para despliegues en la nube,
  ya que SQLite no es ideal para entornos serverless.
- Configurar un proveedor SMTP real (o servicio como Resend) para el envío de
  informes de consulta.
