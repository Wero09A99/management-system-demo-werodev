import type { Money } from "@/types";
import type { EstadoIngreso } from "@/design-system/molecules/estado-ingreso-badge";

/** Cliente tal como lo devuelve la API (getAll / create / update). */
export type Cliente = {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  empresa: string | null;
  fechaRegistro: string;
  notas: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Fila de la lista: cliente + métricas agregadas (calculadas en la API). */
export type ClienteResumen = Cliente & {
  cantidadIngresos: number;
  totalIngresos: Money;
};

/** Ingreso mínimo de un cliente (tipo local: no se importa el módulo ingresos). */
export type IngresoDeCliente = {
  id: string;
  concepto: string;
  categoria: { nombre: string };
  monto: Money;
  metodoPago: string;
  estado: EstadoIngreso;
  fecha: string;
};

/** Detalle de un cliente (getById). */
export type ClienteDetalle = Cliente & {
  cantidadIngresos: number;
  totalIngresos: Money;
  ingresos: IngresoDeCliente[];
};

/** Parámetros de listado. */
export type ClienteListadoParams = {
  search?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
};

/** Parámetros de creación/actualización (campos editables). El servidor valida
 * con Zod; la actualización acepta subconjuntos (p. ej. solo `{ activo }`). */
export type ClienteInput = Partial<{
  nombre: string;
  telefono: string | null;
  correo: string | null;
  empresa: string | null;
  notas: string | null;
  activo: boolean;
}>;