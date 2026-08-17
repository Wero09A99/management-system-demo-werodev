"use client";

import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { StatCard } from "@/design-system/molecules/stat-card";
import { formatMoney } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumenReporte } from "@/modules/reportes/types/reporte.types";

export type ReporteResumenGridProps = {
  resumen?: ResumenReporte;
  loading?: boolean;
};

/**
 * Organismo ReporteResumenGrid: resumen del período.
 */
export function ReporteResumenGrid({ resumen, loading }: ReporteResumenGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!resumen) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Ingresos del período"
        value={formatMoney(resumen.ingresos)}
        icon={TrendingUp}
        tone="positive"
      />
      <StatCard
        label="Gastos del período"
        value={formatMoney(resumen.gastos)}
        icon={TrendingDown}
        tone="negative"
      />
      <StatCard
        label="Utilidad"
        value={formatMoney(resumen.utilidad)}
        icon={Wallet}
        tone={resumen.utilidad >= 0 ? "positive" : "negative"}
        hint={`${resumen.totalMovimientos} movimientos`}
      />
      <StatCard
        label="Margen"
        value={resumen.margen === null ? "—" : `${resumen.margen.toFixed(1)}%`}
        icon={Wallet}
        tone={resumen.margen !== null && resumen.margen >= 0 ? "positive" : "negative"}
        hint="Sobre los ingresos"
      />
    </div>
  );
}