/** Datos que devuelve GET /api/reportes. */

export type ResumenReporte = {
  ingresos: number;
  gastos: number;
  utilidad: number;
  /** Margen sobre ingresos (0-100). null si no hay ingresos. */
  margen: number | null;
  totalMovimientos: number;
};

export type TotalPorCategoria = {
  categoriaId: string;
  categoria: string;
  color: string | null;
  total: number;
  cantidad: number;
};

export type MovimientoReporte = {
  id: string;
  tipo: "INGRESO" | "GASTO";
  concepto: string;
  categoria: string;
  monto: number;
  metodoPago: string;
  fecha: string;
};

export type ReporteData = {
  resumen: ResumenReporte;
  ingresosPorCategoria: TotalPorCategoria[];
  gastosPorCategoria: TotalPorCategoria[];
  movimientos: MovimientoReporte[];
};

export type ReporteParams = {
  desde?: string;
  hasta?: string;
};