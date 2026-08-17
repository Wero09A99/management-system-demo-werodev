import type { ApiResponse } from "@/types";
import type {
  Ingreso,
  IngresoInput,
  IngresoListadoParams,
} from "../types/ingreso.types";

/** Servicio del módulo Ingresos: único punto de acceso a /api/ingresos. */

const BASE = "/api/ingresos";

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

export type ListaIngresosResult = {
  items: Ingreso[];
  total: number;
  page: number;
  pageSize: number;
};

export const ingresoService = {
  async listar(params: IngresoListadoParams = {}): Promise<ListaIngresosResult> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set("search", params.search);
    if (params.categoriaId) searchParams.set("categoriaId", params.categoriaId);
    if (params.estado) searchParams.set("estado", params.estado);
    if (params.clienteId) searchParams.set("clienteId", params.clienteId);
    if (params.desde) searchParams.set("desde", params.desde);
    if (params.hasta) searchParams.set("hasta", params.hasta);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    const qs = searchParams.toString();
    return request<ListaIngresosResult>(`${BASE}${qs ? `?${qs}` : ""}`);
  },

  async crear(data: IngresoInput): Promise<Ingreso> {
    return request<Ingreso>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async actualizar(id: string, data: IngresoInput): Promise<Ingreso> {
    return request<Ingreso>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async eliminar(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`${BASE}/${id}`, { method: "DELETE" });
  },
};