"use client";

import { useCallback, useEffect, useState } from "react";
import { solicitudService } from "@/modules/solicitudes/services/solicitudService";

/** Hook del badge de solicitudes: consulta pendientes con un COUNT normal. */
export function useSolicitudesPendientes() {
  const [pendientes, setPendientes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let activo = true;
    // Se difiere a un callback para no llamar setState sincrónicamente en el efecto.
    const timer = setTimeout(() => {
      void (async () => {
        setCargando(true);
        try {
          const resultado = await solicitudService.listar({
            estado: "PENDIENTE",
            pageSize: 1,
          });
          if (activo) setPendientes(resultado.total);
        } catch {
          if (activo) setPendientes(0);
        } finally {
          if (activo) setCargando(false);
        }
      })();
    }, 0);

    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [refreshKey]);

  return { pendientes, cargando, recargar };
}