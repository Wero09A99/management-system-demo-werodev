import type { ApiResponse } from "@/types";
import type { CategoriaCreateInput, CategoriaUpdateInput } from "../schemas/categoria.schema";
import type { CategoriaResumen } from "../types/categoria.types";

const BASE = "/api/categorias";

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

export const categoriaService = {
  async listar(): Promise<CategoriaResumen[]> {
    return request<CategoriaResumen[]>(BASE);
  },

  async crear(data: CategoriaCreateInput): Promise<CategoriaResumen> {
    const resultado = await request<{ categoria: CategoriaResumen }>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return resultado.categoria;
  },

  async actualizar(id: string, data: CategoriaUpdateInput): Promise<CategoriaResumen> {
    const resultado = await request<{ categoria: CategoriaResumen }>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return resultado.categoria;
  },
};