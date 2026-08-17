/** Datos agregados que devuelve GET /api/dashboard. */

export type ResumenFinanciero = {
  saldoTotal: number;
  ingresosTotales: number;
  gastosTotales: number;
  ingresosMes: number;
  gastosMes: number;
};

export type PuntoMensual = {
  /** Clave del mes en formato YYYY-MM. */
  mes: string;
  /** Etiqueta corta para la gráfica (ej. "ago"). */
  etiqueta: string;
  ingresos: number;
  gastos: number;
};

export type MovimientoReciente = {
  id: string;
  tipo: "INGRESO" | "GASTO";
  concepto: string;
  categoriaNombre: string;
  categoriaColor: string | null;
  monto: number;
  fecha: string;
};

export type DashboardData = {
  resumen: ResumenFinanciero;
  mensual: PuntoMensual[];
  movimientos: MovimientoReciente[];
};