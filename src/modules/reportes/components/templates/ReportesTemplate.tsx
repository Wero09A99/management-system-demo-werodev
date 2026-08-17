"use client";

import { useState } from "react";
import { Download, ListChecks, RefreshCcw } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { PageHeader } from "@/design-system/organisms/page-header";
import { EmptyState } from "@/design-system/organisms/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/atoms/select";
import { DateRangeInput } from "@/design-system/molecules/date-range-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/design-system/atoms/badge";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { useReporte } from "@/modules/reportes/hooks/useReporte";
import { ReporteResumenGrid } from "@/modules/reportes/components/organisms/ReporteResumenGrid";
import { CategoriaTotalesCard } from "@/modules/reportes/components/organisms/CategoriaTotalesCard";
import type { MovimientoReporte } from "@/modules/reportes/types/reporte.types";

const PRESETS = [
  { value: "todo", label: "Todo el historial" },
  { value: "este-mes", label: "Este mes" },
  { value: "mes-pasado", label: "Mes pasado" },
  { value: "ultimos-3", label: "Últimos 3 meses" },
  { value: "ultimos-6", label: "Últimos 6 meses" },
  { value: "este-anio", label: "Este año" },
] as const;

type Preset = (typeof PRESETS)[number]["value"];

function rangoDePreset(preset: Preset, hoy: Date): { desde?: string; hasta?: string } {
  const hoyStr = (d: Date) => {
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
  };

  switch (preset) {
    case "este-mes":
      return {
        desde: hoyStr(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
        hasta: hoyStr(hoy),
      };
    case "mes-pasado":
      return {
        desde: hoyStr(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)),
        hasta: hoyStr(new Date(hoy.getFullYear(), hoy.getMonth(), 0)),
      };
    case "ultimos-3":
      return {
        desde: hoyStr(new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1)),
        hasta: hoyStr(hoy),
      };
    case "ultimos-6":
      return {
        desde: hoyStr(new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1)),
        hasta: hoyStr(hoy),
      };
    case "este-anio":
      return {
        desde: hoyStr(new Date(hoy.getFullYear(), 0, 1)),
        hasta: hoyStr(hoy),
      };
    default:
      return {};
  }
}

function exportarCSV(movimientos: MovimientoReporte[]) {
  const encabezados = ["Tipo", "Concepto", "Categoría", "Monto", "Método", "Fecha"];
  const filas = movimientos.map((m) => [
    m.tipo === "INGRESO" ? "Ingreso" : "Gasto",
    m.concepto,
    m.categoria,
    m.monto.toFixed(2),
    m.metodoPago,
    formatDate(m.fecha),
  ]);

  const escape = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = [encabezados, ...filas].map((fila) => fila.map(escape).join(",")).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `reporte-financiero-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

/**
 * Template ReportesTemplate: análisis financiero por período
 * con exportación a CSV.
 */
export function ReportesTemplate() {
  const { data, loading, error, desde, setDesde, hasta, setHasta, recargar } = useReporte();
  const [preset, setPreset] = useState<Preset>("todo");

  function aplicarPreset(valor: Preset) {
    setPreset(valor);
    const rango = rangoDePreset(valor, new Date());
    setDesde(rango.desde);
    setHasta(rango.hasta);
  }

  const hayPeriodo = Boolean(desde || hasta);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Métricas y análisis del negocio por período."
        actions={
          <Button
            variant="outline"
            onClick={() => data && data.movimientos.length > 0 && exportarCSV(data.movimientos)}
            disabled={loading || !data || data.movimientos.length === 0}
          >
            <Icon icon={Download} />
            Exportar CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <label htmlFor="reporte-periodo" className="mb-1 block text-sm font-medium text-foreground">
            Período
          </label>
          <Select value={preset} onValueChange={(v) => aplicarPreset(v as Preset)}>
            <SelectTrigger id="reporte-periodo" className="w-full">
              <SelectValue placeholder="Selecciona período" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DateRangeInput
          desde={desde}
          hasta={hasta}
          onDesdeChange={(v) => {
            setDesde(v);
            setPreset("todo");
          }}
          onHastaChange={(v) => {
            setHasta(v);
            setPreset("todo");
          }}
        />
        <Button variant="ghost" size="sm" onClick={recargar} disabled={loading}>
          <Icon icon={RefreshCcw} />
          Actualizar
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          <ReporteResumenGrid resumen={data?.resumen} loading={loading} />

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoriaTotalesCard
              title="Ingresos por categoría"
              description="Montos agrupados por categoría de ingreso"
              tipo="ingresos"
              datos={data?.ingresosPorCategoria}
              loading={loading}
            />
            <CategoriaTotalesCard
              title="Gastos por categoría"
              description="Montos agrupados por categoría de gasto"
              tipo="gastos"
              datos={data?.gastosPorCategoria}
              loading={loading}
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-background">
            <div className="px-5 py-4">
              <h2 className="text-base font-semibold">Movimientos del período</h2>
              <p className="text-sm text-muted-foreground">
                {data?.resumen.totalMovimientos ?? 0} registros
              </p>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : data && data.movimientos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.movimientos.map((movimiento) => {
                    const esIngreso = movimiento.tipo === "INGRESO";
                    return (
                      <TableRow key={`${movimiento.tipo}-${movimiento.id}`}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              esIngreso
                                ? "border-emerald-600/30 text-emerald-700"
                                : "border-red-600/30 text-red-700",
                            )}
                          >
                            {esIngreso ? "Ingreso" : "Gasto"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {movimiento.concepto}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                          {movimiento.categoria}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                          {formatDate(movimiento.fecha)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          <span className={esIngreso ? "text-emerald-700" : "text-red-700"}>
                            {esIngreso ? "+" : "−"}
                            {formatMoney(movimiento.monto)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={ListChecks}
                title="Sin movimientos en este período."
                description={
                  hayPeriodo
                    ? "No hay registros en las fechas seleccionadas. Intenta con otro período."
                    : "Aún no hay movimientos registrados."
                }
                className="border-0 bg-muted/30 py-8"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}