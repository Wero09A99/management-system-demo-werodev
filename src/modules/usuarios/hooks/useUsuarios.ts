"use client";

import { useCallback, useEffect, useState } from "react";
import { usuarioService } from "../services/usuarioService";
import type { UsuarioResumen } from "../types/usuario.types";

/**
 * Hook de listado de usuarios: carga los usuarios y permite recargar.
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
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
          const items = await usuarioService.listar();
          if (activo) setUsuarios(items);
        } catch (e) {
          if (activo) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar los usuarios.");
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

  return { usuarios, loading, error, recargar };
}