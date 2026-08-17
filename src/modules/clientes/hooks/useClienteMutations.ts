"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { clienteService } from "../services/clienteService";
import type { ClienteInput } from "../types/cliente.types";

/**
 * Hook de mutaciones de clientes (crear, actualizar, eliminar) con toasts.
 */
export function useClienteMutations() {
  const [pending, setPending] = useState(false);

  const crear = useCallback(async (data: ClienteInput) => {
    setPending(true);
    try {
      const cliente = await clienteService.crear(data);
      toast.success("Cliente creado", { description: `${cliente.nombre} se registró correctamente.` });
      return cliente;
    } catch (e) {
      toast.error("No se pudo crear el cliente", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  const actualizar = useCallback(async (id: string, data: ClienteInput) => {
    setPending(true);
    try {
      const cliente = await clienteService.actualizar(id, data);
      toast.success("Cliente actualizado", { description: "Los cambios se guardaron." });
      return cliente;
    } catch (e) {
      toast.error("No se pudo actualizar el cliente", {
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
      await clienteService.eliminar(id);
      toast.success("Cliente eliminado", { description: "El cliente se eliminó correctamente." });
    } catch (e) {
      toast.error("No se pudo eliminar el cliente", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  return { crear, actualizar, eliminar, pending };
}