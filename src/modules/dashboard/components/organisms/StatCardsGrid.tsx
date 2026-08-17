"use client";

import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { StatCard } from "@/design-system/molecules/stat-card";
import { formatMoney } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumenFinanciero } from "@/modules/dashboard/types/dashboard.types";

export type StatCardsGridProps = {
  resumen?: ResumenFinanciero;
  loading?: boolean;
};

/**
 * Organismo StatCardsGrid: métricas clave del negocio.
 */
export function StatCardsGrid({ resumen, loading }: StatCardsGridProps) {
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

  const saldo = resumen.saldoTotal;
  const utilidadMes = resumen.ingresosMes - resumen.gastosMes;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Saldo total"
        value={formatMoney(saldo)}
        icon={Wallet}
        tone={saldo >= 0 ? "accent" : "negative"}
        hint="Ingresos menos gastos"
      />
      <StatCard
        label="Ingresos del mes"
        value={formatMoney(resumen.ingresosMes)}
        icon={TrendingUp}
        tone="positive"
      />
      <StatCard
        label="Gastos del mes"
        value={formatMoney(resumen.gastosMes)}
        icon={TrendingDown}
        tone="negative"
      />
      <StatCard
        label="Utilidad del mes"
        value={formatMoney(utilidadMes)}
        icon={Wallet}
        tone={utilidadMes >= 0 ? "positive" : "negative"}
        hint="Ingresos menos gastos del mes"
      />
    </div>
  );
}