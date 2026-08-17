"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { clienteService, type ListaClientesResult } from "../services/clienteService";

/**
 * Hook de listado de clientes: búsqueda (con debounce), filtro de estado,
 * paginación y recarga manual.
 */
export function useClientes() {
  const [search, setSearch] = useState("");
  const [activo, setActivo] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListaClientesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mantener el término de búsqueda estable para el efecto del debounce.
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    let activoRequest = true;
    // Se difiere a un callback para no llamar setState sincrónicamente en el efecto.
    const timer = setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const resultado = await clienteService.listar({
            search: debouncedSearch || undefined,
            activo,
            page,
            pageSize: 10,
          });
          if (activoRequest) setData(resultado);
        } catch (e) {
          if (activoRequest) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar los clientes.");
          }
        } finally {
          if (activoRequest) {
            setLoading(false);
          }
        }
      })();
    }, 0);

    return () => {
      activoRequest = false;
      clearTimeout(timer);
    };
  }, [debouncedSearch, activo, page, refreshKey]);

  const cambiarBusqueda = useCallback((valor: string) => {
    setSearch(valor);
    setPage(1);
  }, []);

  const cambiarActivo = useCallback((valor: boolean | undefined) => {
    setActivo(valor);
    setPage(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setSearch("");
    setActivo(undefined);
    setPage(1);
  }, []);

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);
  const irAPagina = useCallback((nuevaPagina: number) => setPage(nuevaPagina), []);

  return {
    clientes: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    totalPages: data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1,
    loading,
    error,
    search,
    setSearch: cambiarBusqueda,
    activo,
    setActivo: cambiarActivo,
    limpiarFiltros,
    recargar,
    irAPagina,
  };
}