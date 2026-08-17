"use client";

import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import type { DashboardData } from "../types/dashboard.types";

/**
 * Hook del dashboard: carga los datos agregados una sola vez
 * con estado de carga/error y recarga manual.
 */
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
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
          const datos = await dashboardService.obtener();
          if (activo) setData(datos);
        } catch (e) {
          if (activo) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar los datos.");
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
  }, [refreshKey]);

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { data, loading, error, recargar };
}