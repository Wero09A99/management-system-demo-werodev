import type { ApiResponse } from "@/types";

/** Categoría tal como la devuelve /api/categorias. */
export type Categoria = {
  id: string;
  nombre: string;
  tipo: "INGRESO" | "GASTO";
  color: string | null;
  activa: boolean;
};

/**
 * Servicio compartido de categorías (lib, no pertenece a ningún módulo).
 * Evita que los módulos importen datos de otro módulo directamente.
 */
export const categoriasService = {
  async listar(tipo?: "INGRESO" | "GASTO", soloActivas = true): Promise<Categoria[]> {
    const searchParams = new URLSearchParams();
    if (tipo) searchParams.set("tipo", tipo);
    if (soloActivas) searchParams.set("activas", "true");
    const res = await fetch(`/api/categorias?${searchParams.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });
    const body = (await res.json()) as ApiResponse<Categoria[]>;
    if (!res.ok || !("data" in body)) {
      throw new Error("error" in body ? body.error : "No se pudieron cargar las categorías.");
    }
    return body.data;
  },
};