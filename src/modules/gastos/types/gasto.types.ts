import type { Money } from "@/types";

export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTRO";

/** Referencia mínima de categoría dentro de un gasto (tipo local). */
export type CategoriaReferencia = {
  id: string;
  nombre: string;
  color: string | null;
};

/** Gasto tal como lo devuelve la API. */
export type Gasto = {
  id: string;
  concepto: string;
  categoriaId: string;
  categoria: CategoriaReferencia;
  monto: Money;
  metodoPago: MetodoPago;
  fecha: string;
  notas: string | null;
  creadoPorId: string;
  createdAt: string;
  updatedAt: string;
};

/** Fila de la lista (misma forma que el detalle). */
export type GastoResumen = Gasto;

/** Parámetros de listado/filtrado. */
export type GastoListadoParams = {
  search?: string;
  categoriaId?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
};

/** Campos editables (parcial; el servidor valida con Zod). */
export type GastoInput = Partial<{
  concepto: string;
  categoriaId: string;
  monto: number;
  metodoPago: MetodoPago;
  fecha: string;
  notas: string | null;
}>;