-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('INGRESO', 'GASTO');

-- CreateEnum
CREATE TYPE "EstadoIngreso" AS ENUM ('PENDIENTE', 'ANTICIPO', 'LIQUIDADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO');

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "empresa" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCategoria" NOT NULL,
    "color" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingresos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "concepto" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "estado" "EstadoIngreso" NOT NULL DEFAULT 'LIQUIDADO',
    "fecha" TIMESTAMP(3) NOT NULL,
    "notas" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'manual',
    "origenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingresos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ingresos" ADD CONSTRAINT "ingresos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingresos" ADD CONSTRAINT "ingresos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
