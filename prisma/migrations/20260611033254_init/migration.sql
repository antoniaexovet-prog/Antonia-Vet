-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 45,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Comuna" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "surcharge" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "petName" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "petAge" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "comunaId" TEXT NOT NULL,
    "speciesSurcharge" INTEGER NOT NULL DEFAULT 0,
    "totalPrice" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentRef" TEXT,
    "patientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_comunaId_fkey" FOREIGN KEY ("comunaId") REFERENCES "Comuna" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "photo" TEXT,
    "antecedentes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "temperature" REAL,
    "weight" REAL,
    "heartRate" INTEGER,
    "respRate" INTEGER,
    "notes" TEXT,
    "diagnosis" TEXT,
    "indications" TEXT,
    "reportContent" TEXT,
    "reportSentAt" DATETIME,
    "reportSentTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Consultation_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_key_key" ON "Service"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Comuna_name_key" ON "Comuna"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_appointmentId_key" ON "Consultation"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
