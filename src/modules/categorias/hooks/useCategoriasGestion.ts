"use client";

import { useCallback, useEffect, useState } from "react";
import { categoriaService } from "../services/categoriaService";
import type { CategoriaResumen } from "../types/categoria.types";

/**
 * Hook de listado de categorías (incluye inactivas) con recarga.
 */
export function useCategoriasGestion() {
  const [categorias, setCategorias] = useState<CategoriaResumen[]>([]);
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
          const items = await categoriaService.listar();
          if (activo) setCategorias(items);
        } catch (e) {
          if (activo) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar las categorías.");
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

  return { categorias, loading, error, recargar };
}