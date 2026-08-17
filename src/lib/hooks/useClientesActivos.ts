"use client";

import { useEffect, useState } from "react";
import {
  clientesSelectService,
  type ClienteSelect,
} from "@/lib/services/clientes";

/**
 * Hook compartido: clientes activos para selectores.
 */
export function useClientesActivos() {
  const [clientes, setClientes] = useState<ClienteSelect[]>([]);
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
          const resultado = await clientesSelectService.listarActivos();
          if (activoRequest) setClientes(resultado);
        } catch (e) {
          if (activoRequest) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar los clientes.");
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
  }, []);

  return { clientes, loading, error };
}