"use client";

import { useEffect, useState } from "react";
import {
  categoriasService,
  type Categoria,
} from "@/lib/services/categorias";

/**
 * Hook compartido: lista de categorías (filtradas por tipo opcional).
 */
export function useCategorias(tipo?: "INGRESO" | "GASTO") {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activoRequest = true;
    // Se difiere a un callback para no llamar setState sincrónicamente en el efecto.
    const timer = setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const resultado = await categoriasService.listar(tipo);
          if (activoRequest) setCategorias(resultado);
        } catch (e) {
          if (activoRequest) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar las categorías.");
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
  }, [tipo]);

  return { categorias, loading, error };
}