"use client";

import { useCallback, useEffect, useState } from "react";
import { reporteService } from "../services/reporteService";
import type { ReporteData } from "../types/reporte.types";

/**
 * Hook de reportes: carga los datos agregados según el período
 * seleccionado, con estado de carga/error y recarga manual.
 */
export function useReporte() {
  const [desde, setDesde] = useState<string | undefined>(undefined);
  const [hasta, setHasta] = useState<string | undefined>(undefined);
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let activo = true;
    const timer = setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const datos = await reporteService.obtener({ desde, hasta });
          if (activo) setData(datos);
        } catch (e) {
          if (activo) {
            setError(e instanceof Error ? e.message : "No se pudieron generar los reportes.");
          }
        } finally {
          if (activo) setLoading(false);
        }
      })();
    }, 0);

    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [desde, hasta, refreshKey]);

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    data,
    loading,
    error,
    desde,
    setDesde,
    hasta,
    setHasta,
    recargar,
  };
}