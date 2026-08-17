/** Tipos cross-dominio compartidos por todos los módulos. */

/** Dinero: se transporta como number en la API (el Decimal de Prisma se convierte). */
export type Money = number;

/** Rango de fechas (ISO 8601). */
export type DateRange = {
  desde?: string;
  hasta?: string;
};

/**
 * Respuesta estándar de las API routes.
 * Éxito: `{ data }`. Error: `{ error }`.
 */
export type ApiResponse<T> =
  | { data: T }
  | { error: string };

/** Respuesta paginada. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Orden de una columna en las tablas. */
export type SortDirection = "asc" | "desc";
