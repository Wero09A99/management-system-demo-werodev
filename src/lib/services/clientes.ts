import type { ApiResponse } from "@/types";

/** Cliente mínimo para selectores (id + nombre). */
export type ClienteSelect = {
  id: string;
  nombre: string;
  empresa: string | null;
};

type ClienteListResponse = {
  items: ClienteSelect[];
};

/**
 * Servicio compartido de clientes para selectores (lib).
 * Usado por módulos que necesitan referenciar clientes (p. ej. ingresos).
 */
export const clientesSelectService = {
  async listarActivos(): Promise<ClienteSelect[]> {
    const res = await fetch("/api/clientes?activo=true&pageSize=100", {
      headers: { "Content-Type": "application/json" },
    });
    const body = (await res.json()) as ApiResponse<ClienteListResponse>;
    if (!res.ok || !("data" in body)) {
      throw new Error("error" in body ? body.error : "No se pudieron cargar los clientes.");
    }
    return body.data.items;
  },
};