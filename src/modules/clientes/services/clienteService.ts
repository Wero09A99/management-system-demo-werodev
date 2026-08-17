import type { ApiResponse } from "@/types";
import type {
  Cliente,
  ClienteDetalle,
  ClienteInput,
  ClienteListadoParams,
  ClienteResumen,
} from "../types/cliente.types";

/** Servicio del módulo Clientes: único punto de acceso a /api/clientes. */

const BASE = "/api/clientes";

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

export type ListaClientesResult = {
  items: ClienteResumen[];
  total: number;
  page: number;
  pageSize: number;
};

export const clienteService = {
  async listar(params: ClienteListadoParams = {}): Promise<ListaClientesResult> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set("search", params.search);
    if (params.activo !== undefined) searchParams.set("activo", String(params.activo));
    if (params.page) searchParams.set("page", String(params.page));
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    const qs = searchParams.toString();
    return request<ListaClientesResult>(`${BASE}${qs ? `?${qs}` : ""}`);
  },

  async obtener(id: string): Promise<ClienteDetalle> {
    return request<ClienteDetalle>(`${BASE}/${id}`);
  },

  async crear(data: ClienteInput): Promise<Cliente> {
    return request<Cliente>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async actualizar(id: string, data: ClienteInput): Promise<Cliente> {
    return request<Cliente>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async eliminar(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`${BASE}/${id}`, { method: "DELETE" });
  },
};