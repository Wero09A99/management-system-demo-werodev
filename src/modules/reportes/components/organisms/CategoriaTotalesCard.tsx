"use client";

import { Tags } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/design-system/organisms/empty-state";
import { formatMoney } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { TotalPorCategoria } from "@/modules/reportes/types/reporte.types";

export type CategoriaTotalesCardProps = {
  title: string;
  description: string;
  tipo: "ingresos" | "gastos";
  datos?: TotalPorCategoria[];
  loading?: boolean;
};

const BAR_COLORS = {
  ingresos: "bg-primary",
  gastos: "bg-red-600",
} as const;

/**
 * Organismo CategoriaTotalesCard: desglose de montos por categoría
 * con barras proporcionales al máximo del conjunto.
 */
export function CategoriaTotalesCard({
  title,
  description,
  tipo,
  datos,
  loading,
}: CategoriaTotalesCardProps) {
  const maximo = datos && datos.length > 0 ? datos[0].total : 1;

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : datos && datos.length > 0 ? (
          <ul className="space-y-3">
            {datos.map((fila) => (
              <li key={fila.categoriaId}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: fila.color ?? undefined }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-muted-foreground">{fila.categoria}</span>
                    <span className="shrink-0 text-xs text-muted-foreground/70">
                      ({fila.cantidad})
                    </span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatMoney(fila.total)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[tipo]}`}
                    style={{ width: `${Math.max(2, (fila.total / maximo) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Tags}
            title="Sin registros en este período."
            description="No hay movimientos en las fechas seleccionadas."
            className="border-0 bg-muted/30 py-8"
          />
        )}
      </CardContent>
    </Card>
  );
}