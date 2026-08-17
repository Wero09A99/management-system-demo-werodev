"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartNoAxesCombined } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/design-system/organisms/empty-state";
import { formatMoney } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { PuntoMensual } from "@/modules/dashboard/types/dashboard.types";

const CHART_CONFIG = {
  ingresos: {
    label: "Ingresos",
    color: "#0B5FFF",
  },
  gastos: {
    label: "Gastos",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export type GraficaMensualProps = {
  data?: PuntoMensual[];
  loading?: boolean;
  /** Acciones opcionales a la derecha del título (p. ej. volver a la vista 3D). */
  action?: ReactNode;
};

/**
 * Organismo GraficaMensual: barras de ingresos vs gastos de los últimos 6 meses.
 */
export function GraficaMensual({ data, loading, action }: GraficaMensualProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Movimiento mensual</CardTitle>
            <CardDescription>Ingresos y gastos de los últimos 6 meses</CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : data && data.length > 0 ? (
          <ChartContainer config={CHART_CONFIG} className="h-[280px] w-full">
            <BarChart accessibilityLayer data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="etiqueta"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatMoney(typeof value === "number" ? value : Number(value))
                    }
                  />
                }
              />
              <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={4} />
              <Bar dataKey="gastos" fill="var(--color-gastos)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyState
            icon={ChartNoAxesCombined}
            title="Sin datos para mostrar."
            description="Registra ingresos o gastos para ver la tendencia mensual."
            className="border-0 bg-muted/30 py-10"
          />
        )}
      </CardContent>
    </Card>
  );
}