"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { gastoService } from "../services/gastoService";
import type { GastoInput } from "../types/gasto.types";

/**
 * Hook de mutaciones de gastos (crear, actualizar, eliminar) con toasts.
 */
export function useGastoMutations() {
  const [pending, setPending] = useState(false);

  const crear = useCallback(async (data: GastoInput) => {
    setPending(true);
    try {
      const gasto = await gastoService.crear(data);
      toast.success("Gasto registrado", {
        description: `Se registró "${gasto.concepto}".`,
      });
      return gasto;
    } catch (e) {
      toast.error("No se pudo registrar el gasto", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  const actualizar = useCallback(async (id: string, data: GastoInput) => {
    setPending(true);
    try {
      const gasto = await gastoService.actualizar(id, data);
      toast.success("Gasto actualizado", { description: "Los cambios se guardaron." });
      return gasto;
    } catch (e) {
      toast.error("No se pudo actualizar el gasto", {
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
      await gastoService.eliminar(id);
      toast.success("Gasto eliminado", { description: "El gasto se eliminó correctamente." });
    } catch (e) {
      toast.error("No se pudo eliminar el gasto", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  return { crear, actualizar, eliminar, pending };
}