"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { categoriaService } from "../services/categoriaService";
import type { CategoriaCreateInput, CategoriaUpdateInput } from "../schemas/categoria.schema";

/**
 * Hook de creación y edición de categorías con toast.
 */
export function useCategoriaMutations() {
  const [pending, setPending] = useState(false);

  const crear = useCallback(async (data: CategoriaCreateInput) => {
    setPending(true);
    try {
      const categoria = await categoriaService.crear(data);
      toast.success("Categoría creada", {
        description: `${categoria.nombre} se registró correctamente.`,
      });
      return categoria;
    } catch (e) {
      toast.error("No se pudo crear la categoría", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  const actualizar = useCallback(async (id: string, data: CategoriaUpdateInput) => {
    setPending(true);
    try {
      const categoria = await categoriaService.actualizar(id, data);
      toast.success("Categoría actualizada", {
        description: `${categoria.nombre} se actualizó correctamente.`,
      });
      return categoria;
    } catch (e) {
      toast.error("No se pudo actualizar la categoría", {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    } finally {
      setPending(false);
    }
  }, []);

  return { crear, actualizar, pending };
}