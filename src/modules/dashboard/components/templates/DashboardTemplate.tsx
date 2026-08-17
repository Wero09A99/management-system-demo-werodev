"use client";

import dynamic from "next/dynamic";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { PageHeader } from "@/design-system/organisms/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardsGrid } from "@/modules/dashboard/components/organisms/StatCardsGrid";
import { GraficaMensual } from "@/modules/dashboard/components/organisms/GraficaMensual";
import { MovimientosRecientesTable } from "@/modules/dashboard/components/organisms/MovimientosRecientesTable";
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard";
import { useTema } from "@/design-system/providers/ThemeProvider";

/**
 * Gráfica galaxia (react-three-fiber) cargada solo en el cliente.
 * ssr:false evita hidratar WebGL desde el servidor.
 */
const GraficaGalaxia = dynamic(
  () =>
    import("@/modules/dashboard/components/organisms/GraficaGalaxia").then(
      (m) => m.GraficaGalaxia,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full rounded-xl" />,
  },
);

/**
 * Template DashboardTemplate: vista general del estado financiero.
 * La gráfica 3D de galaxia se muestra solo cuando el tema es Galaxia.
 */
export function DashboardTemplate() {
  const { data, loading, error, recargar } = useDashboard();
  const { tema } = useTema();
  const esGalaxia = tema === "galaxia";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen del estado financiero del negocio."
        actions={
          <Button variant="outline" onClick={recargar} disabled={loading}>
            <Icon icon={RefreshCcw} />
            Actualizar
          </Button>
        }
      />

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          <StatCardsGrid resumen={data?.resumen} loading={loading} />
          <div className="grid gap-6 lg:grid-cols-2">
            {esGalaxia ? (
              <GraficaGalaxia data={data?.mensual} loading={loading} />
            ) : (
              <GraficaMensual data={data?.mensual} loading={loading} />
            )}
            <MovimientosRecientesTable movimientos={data?.movimientos} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}