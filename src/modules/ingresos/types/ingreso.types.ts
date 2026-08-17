import type { Money } from "@/types";
import type { EstadoIngreso } from "@/design-system/molecules/estado-ingreso-badge";
import type { MetodoPago } from "@/design-system/molecules/metodo-pago-badge";

export type { EstadoIngreso } from "@/design-system/molecules/estado-ingreso-badge";
export type { MetodoPago } from "@/design-system/molecules/metodo-pago-badge";

/** Referencia mínima de cliente dentro de un ingreso (tipo local). */
export type ClienteReferencia = {
  id: string;
  nombre: string;
  empresa: string | null;
};

/** Referencia mínima de categoría dentro de un ingreso (tipo local). */
export type CategoriaReferencia = {
  id: string;
  nombre: string;
  color: string | null;
};

/** Ingreso tal como lo devuelve la API. */
export type Ingreso = {
  id: string;
  clienteId: string | null;
  cliente: ClienteReferencia | null;
  concepto: string;
  categoriaId: string;
  categoria: CategoriaReferencia;
  monto: Money;
  metodoPago: MetodoPago;
  estado: EstadoIngreso;
  fecha: string;
  notas: string | null;
  origen: string;
  origenId: string | null;
  creadoPorId: string;
  createdAt: string;
  updatedAt: string;
};

/** Fila de la lista (misma forma que el detalle). */
export type IngresoResumen = Ingreso;

/** Parámetros de listado/filtrado. */
export type IngresoListadoParams = {
  search?: string;
  categoriaId?: string;
  estado?: EstadoIngreso;
  clienteId?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
};

/** Campos editables (parcial; el servidor valida con Zod). */
export type IngresoInput = Partial<{
  clienteId: string | null;
  concepto: string;
  categoriaId: string;
  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoIngreso;
  fecha: string;
  notas: string | null;
}>;