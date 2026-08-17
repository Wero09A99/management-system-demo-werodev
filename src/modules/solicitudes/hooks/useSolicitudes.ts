"use client";

import { useCallback, useEffect, useState } from "react";
import { solicitudService, type ListaSolicitudesResult } from "../services/solicitudService";
import type { EstadoSolicitud } from "../types/solicitud.types";

/**
 * Hook de listado de solicitudes con filtro por estado y paginación.
 */
export function useSolicitudes() {
  const [estado, setEstado] = useState<EstadoSolicitud | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [resultado, setResultado] = useState<ListaSolicitudesResult>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let activo = true;
    // Se difiere a un callback para no llamar setState sincrónicamente en el efecto.
    const timer = setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await solicitudService.listar({ estado, page, pageSize: 10 });
          if (activo) setResultado(data);
        } catch (e) {
          if (activo) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar las solicitudes.");
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
  }, [estado, page, refreshKey]);

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);

  const cambiarEstado = useCallback((e: EstadoSolicitud | undefined) => {
    setEstado(e);
    setPage(1);
  }, []);

  const irAPagina = useCallback((p: number) => setPage(p), []);

  return {
    solicitudes: resultado.items,
    total: resultado.total,
    page: resultado.page,
    totalPages: Math.max(1, Math.ceil(resultado.total / resultado.pageSize)),
    loading,
    error,
    estado,
    setEstado: cambiarEstado,
    recargar,
    irAPagina,
  };
}