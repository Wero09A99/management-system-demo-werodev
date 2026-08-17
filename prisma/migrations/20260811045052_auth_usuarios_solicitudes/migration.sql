/*
  Warnings:

  - Added the required column `creadoPorId` to the `gastos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creadoPorId` to the `ingresos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'OPERADOR', 'CONSULTA');

-- CreateEnum
CREATE TYPE "EntidadEliminable" AS ENUM ('INGRESO', 'GASTO');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- AlterTable
ALTER TABLE "gastos" ADD COLUMN     "creadoPorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ingresos" ADD COLUMN     "creadoPorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'OPERADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_eliminacion" (
    "id" TEXT NOT NULL,
    "entidadTipo" "EntidadEliminable" NOT NULL,
    "entidadId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "resueltoPorId" TEXT,
    "comentario" TEXT,
    "resueltoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_eliminacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- AddForeignKey
ALTER TABLE "ingresos" ADD CONSTRAINT "ingresos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_eliminacion" ADD CONSTRAINT "solicitudes_eliminacion_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_eliminacion" ADD CONSTRAINT "solicitudes_eliminacion_resueltoPorId_fkey" FOREIGN KEY ("resueltoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
