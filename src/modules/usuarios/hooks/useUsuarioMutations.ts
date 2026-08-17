"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { usuarioService } from "../services/usuarioService";
import type { UsuarioCreateInput, UsuarioUpdateInput } from "../schemas/usuario.schema";

/**
 * Hook de creación y edición de usuarios con toast.
 */
export function useUsuarioMutations() {
  const [pending, setPending] = useState(false);

  const crear = useCallback(async (data: UsuarioCreateInput) => {
    setPending(true);
    try {
      const usuario = await usuarioService.crear(data);
      toast.success("Usuario creado", {
        description: `${usuario.nombre} se registró correctamente.`,
      });
      return usuario;
    } catch (e) {
      toast.error("No se pudo crear el usuario", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  const actualizar = useCallback(async (id: string, data: UsuarioUpdateInput) => {
    setPending(true);
    try {
      const usuario = await usuarioService.actualizar(id, data);
      toast.success("Usuario actualizado", {
        description: `${usuario.nombre} se actualizó correctamente.`,
      });
      return usuario;
    } catch (e) {
      toast.error("No se pudo actualizar el usuario", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  return { crear, actualizar, pending };
}