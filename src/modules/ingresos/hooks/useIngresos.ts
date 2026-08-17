"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { ingresoService, type ListaIngresosResult } from "../services/ingresoService";
import type { EstadoIngreso } from "../types/ingreso.types";

/**
 * Hook de listado de ingresos: búsqueda, filtros (categoría, estado, rango),
 * paginación y recarga manual.
 */
export function useIngresos() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoIngreso | undefined>(undefined);
  const [categoriaId, setCategoriaId] = useState<string | undefined>(undefined);
  const [desde, setDesde] = useState<string | undefined>(undefined);
  const [hasta, setHasta] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListaIngresosResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    let activoRequest = true;
    // Se difiere a un callback para no llamar setState sincrónicamente en el efecto.
    const timer = setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const resultado = await ingresoService.listar({
            search: debouncedSearch || undefined,
            estado,
            categoriaId,
            desde,
            hasta,
            page,
            pageSize: 10,
          });
          if (activoRequest) setData(resultado);
        } catch (e) {
          if (activoRequest) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar los ingresos.");
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
  }, [debouncedSearch, estado, categoriaId, desde, hasta, page, refreshKey]);

  const cambiarBusqueda = useCallback((valor: string) => {
    setSearch(valor);
    setPage(1);
  }, []);

  const cambiarEstado = useCallback((valor: EstadoIngreso | undefined) => {
    setEstado(valor);
    setPage(1);
  }, []);

  const cambiarCategoria = useCallback((valor: string | undefined) => {
    setCategoriaId(valor);
    setPage(1);
  }, []);

  const cambiarDesde = useCallback((valor: string | undefined) => {
    setDesde(valor);
    setPage(1);
  }, []);

  const cambiarHasta = useCallback((valor: string | undefined) => {
    setHasta(valor);
    setPage(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setSearch("");
    setEstado(undefined);
    setCategoriaId(undefined);
    setDesde(undefined);
    setHasta(undefined);
    setPage(1);
  }, []);

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);
  const irAPagina = useCallback((nuevaPagina: number) => setPage(nuevaPagina), []);

  return {
    ingresos: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    totalPages: data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1,
    loading,
    error,
    search,
    setSearch: cambiarBusqueda,
    estado,
    setEstado: cambiarEstado,
    categoriaId,
    setCategoriaId: cambiarCategoria,
    desde,
    setDesde: cambiarDesde,
    hasta,
    setHasta: cambiarHasta,
    limpiarFiltros,
    recargar,
    irAPagina,
  };
}