"use client";

import { useCallback, useEffect, useState } from "react";
import { clienteService } from "../services/clienteService";
import type { ClienteDetalle } from "../types/cliente.types";

/**
 * Hook de detalle de un cliente, con recarga manual.
 */
export function useCliente(id: string) {
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let activoRequest = true;
    // Se difiere a un callback para no llamar setState sincrónicamente en el efecto.
    const timer = setTimeout(() => {
      void (async () => {
        setCliente(null);
        setLoading(true);
        setError(null);
        try {
          const detalle = await clienteService.obtener(id);
          if (activoRequest) setCliente(detalle);
        } catch (e) {
          if (activoRequest) {
            setError(e instanceof Error ? e.message : "No se pudo cargar el cliente.");
          }
        } finally {
          if (activoRequest) setLoading(false);
        }
      })();
    }, 0);

    return () => {
      activoRequest = false;
      clearTimeout(timer);
    };
  }, [id, refreshKey]);

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { cliente, loading, error, recargar };
}