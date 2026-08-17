import type { ApiResponse } from "@/types";
import type { Gasto, GastoInput, GastoListadoParams } from "../types/gasto.types";

/** Servicio del módulo Gastos: único punto de acceso a /api/gastos. */

const BASE = "/api/gastos";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error("error" in body ? body.error : "Error inesperado del servidor.");
  }

  if (!("data" in body)) {
    throw new Error("Respuesta inválida del servidor.");
  }

  return body.data;
}

export type ListaGastosResult = {
  items: Gasto[];
  total: number;
  page: number;
  pageSize: number;
};

export const gastoService = {
  async listar(params: GastoListadoParams = {}): Promise<ListaGastosResult> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set("search", params.search);
    if (params.categoriaId) searchParams.set("categoriaId", params.categoriaId);
    if (params.desde) searchParams.set("desde", params.desde);
    if (params.hasta) searchParams.set("hasta", params.hasta);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    const qs = searchParams.toString();
    return request<ListaGastosResult>(`${BASE}${qs ? `?${qs}` : ""}`);
  },

  async crear(data: GastoInput): Promise<Gasto> {
    return request<Gasto>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async actualizar(id: string, data: GastoInput): Promise<Gasto> {
    return request<Gasto>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async eliminar(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`${BASE}/${id}`, { method: "DELETE" });
  },
};