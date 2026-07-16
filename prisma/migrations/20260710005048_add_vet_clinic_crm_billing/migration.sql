-- CreateEnum
CREATE TYPE "Species" AS ENUM ('DOG', 'CAT', 'BIRD', 'RABBIT', 'REPTILE', 'OTHER');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'VOIDED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REMINDER', 'VACCINE_REMINDER');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "docType" TEXT,
    "docNumber" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "breed" TEXT,
    "sex" "Sex" NOT NULL DEFAULT 'UNKNOWN',
    "birthDate" DATE,
    "weightKg" DECIMAL(6,3),
    "color" TEXT,
    "microchip" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deceasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "vetId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "vetId" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DECIMAL(6,3),
    "temperatureC" DECIMAL(4,1),
    "anamnesis" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "prescription" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccine" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "medicalRecordId" TEXT,
    "vetId" TEXT,
    "name" TEXT NOT NULL,
    "batchNumber" TEXT,
    "appliedAt" DATE NOT NULL,
    "nextDueAt" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Vaccine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProductType" NOT NULL DEFAULT 'PRODUCT',
    "price" DECIMAL(12,2) NOT NULL,
    "cost" DECIMAL(12,2),
    "stock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "trackStock" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT,
    "cashierId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "tipoComprobante" TEXT,
    "serie" TEXT,
    "correlativo" INTEGER,
    "estadoSunat" TEXT,
    "hashFirma" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "petId" TEXT,
    "appointmentId" TEXT,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'WHATSAPP',
    "type" "NotificationType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "payload" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "providerMsgId" TEXT,
    "error" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Owner_organizationId_lastName_firstName_idx" ON "Owner"("organizationId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "Owner_organizationId_phone_idx" ON "Owner"("organizationId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_organizationId_docNumber_key" ON "Owner"("organizationId", "docNumber");

-- CreateIndex
CREATE INDEX "Pet_organizationId_ownerId_idx" ON "Pet"("organizationId", "ownerId");

-- CreateIndex
CREATE INDEX "Pet_organizationId_name_idx" ON "Pet"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Appointment_organizationId_scheduledAt_idx" ON "Appointment"("organizationId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Appointment_organizationId_vetId_scheduledAt_idx" ON "Appointment"("organizationId", "vetId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Appointment_organizationId_petId_idx" ON "Appointment"("organizationId", "petId");

-- CreateIndex
CREATE INDEX "Appointment_organizationId_status_scheduledAt_idx" ON "Appointment"("organizationId", "status", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_appointmentId_key" ON "MedicalRecord"("appointmentId");

-- CreateIndex
CREATE INDEX "MedicalRecord_organizationId_petId_visitDate_idx" ON "MedicalRecord"("organizationId", "petId", "visitDate" DESC);

-- CreateIndex
CREATE INDEX "Vaccine_organizationId_petId_idx" ON "Vaccine"("organizationId", "petId");

-- CreateIndex
CREATE INDEX "Vaccine_organizationId_nextDueAt_idx" ON "Vaccine"("organizationId", "nextDueAt");

-- CreateIndex
CREATE INDEX "Product_organizationId_name_idx" ON "Product"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Product_organizationId_type_isActive_idx" ON "Product"("organizationId", "type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_sku_key" ON "Product"("organizationId", "sku");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_issuedAt_idx" ON "Invoice"("organizationId", "issuedAt" DESC);

-- CreateIndex
CREATE INDEX "Invoice_organizationId_ownerId_idx" ON "Invoice"("organizationId", "ownerId");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_status_idx" ON "Invoice"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organizationId_serie_correlativo_key" ON "Invoice"("organizationId", "serie", "correlativo");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_organizationId_productId_idx" ON "InvoiceItem"("organizationId", "productId");

-- CreateIndex
CREATE INDEX "NotificationLog_organizationId_status_scheduledFor_idx" ON "NotificationLog"("organizationId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "NotificationLog_providerMsgId_idx" ON "NotificationLog"("providerMsgId");

-- CreateIndex
CREATE INDEX "NotificationLog_organizationId_appointmentId_idx" ON "NotificationLog"("organizationId", "appointmentId");

-- CreateIndex
CREATE INDEX "NotificationLog_organizationId_petId_idx" ON "NotificationLog"("organizationId", "petId");

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Reglas de negocio no expresables en Prisma:
-- peso SIEMPRE en kg y positivo; cantidades de venta positivas.
ALTER TABLE "Pet"           ADD CONSTRAINT pet_weight_kg_positive CHECK ("weightKg" IS NULL OR "weightKg" > 0);
ALTER TABLE "MedicalRecord" ADD CONSTRAINT mr_weight_kg_positive  CHECK ("weightKg" IS NULL OR "weightKg" > 0);
ALTER TABLE "InvoiceItem"   ADD CONSTRAINT item_qty_positive      CHECK ("quantity" > 0);
