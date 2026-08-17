"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { solicitudService } from "../services/solicitudService";
import type { SolicitudCreateInput } from "../schemas/solicitud.schema";

/**
 * Hook para crear solicitudes de eliminación de ingresos/gastos.
 * Compartido (única importación cruzada permitida) por IngresoTable y GastoTable.
 */
export function useCrearSolicitud() {
  const [pending, setPending] = useState(false);

  const crear = useCallback(async (data: SolicitudCreateInput) => {
    setPending(true);
    try {
      const solicitud = await solicitudService.crear(data);
      toast.success("Solicitud enviada", {
        description: "Un administrador la revisará para eliminar el registro.",
      });
      return solicitud;
    } catch (e) {
      toast.error("No se pudo enviar la solicitud", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  return { crear, pending };
}