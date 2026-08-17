"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ingresoService } from "../services/ingresoService";
import type { IngresoInput } from "../types/ingreso.types";

/**
 * Hook de mutaciones de ingresos (crear, actualizar, eliminar) con toasts.
 */
export function useIngresoMutations() {
  const [pending, setPending] = useState(false);

  const crear = useCallback(async (data: IngresoInput) => {
    setPending(true);
    try {
      const ingreso = await ingresoService.crear(data);
      toast.success("Ingreso registrado", {
        description: `Se registró "${ingreso.concepto}".`,
      });
      return ingreso;
    } catch (e) {
      toast.error("No se pudo registrar el ingreso", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  const actualizar = useCallback(async (id: string, data: IngresoInput) => {
    setPending(true);
    try {
      const ingreso = await ingresoService.actualizar(id, data);
      toast.success("Ingreso actualizado", { description: "Los cambios se guardaron." });
      return ingreso;
    } catch (e) {
      toast.error("No se pudo actualizar el ingreso", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  const eliminar = useCallback(async (id: string) => {
    setPending(true);
    try {
      await ingresoService.eliminar(id);
      toast.success("Ingreso eliminado", { description: "El ingreso se eliminó correctamente." });
    } catch (e) {
      toast.error("No se pudo eliminar el ingreso", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  return { crear, actualizar, eliminar, pending };
}