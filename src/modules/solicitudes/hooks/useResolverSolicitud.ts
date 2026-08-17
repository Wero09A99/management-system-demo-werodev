"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { solicitudService } from "../services/solicitudService";
import type { SolicitudResolucionInput } from "../schemas/solicitud.schema";

/**
 * Hook para aprobar/rechazar solicitudes (solo ADMIN).
 */
export function useResolverSolicitud() {
  const [pending, setPending] = useState(false);

  const resolver = useCallback(async (id: string, data: SolicitudResolucionInput) => {
    setPending(true);
    try {
      const solicitud = await solicitudService.resolver(id, data);
      const aprobada = solicitud.estado === "APROBADA";
      toast.success(
        aprobada ? "Solicitud aprobada" : "Solicitud rechazada",
        { description: aprobada ? "El registro fue eliminado." : "El registro se mantiene." },
      );
      return solicitud;
    } catch (e) {
      toast.error("No se pudo resolver la solicitud", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  return { resolver, pending };
}