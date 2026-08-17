import type { ApiResponse } from "@/types";
import type { UsuarioDto } from "@/lib/auth/usuario-dto";
import type { UsuarioCreateInput, UsuarioUpdateInput } from "../schemas/usuario.schema";

/** Servicio del módulo Usuarios: único punto de acceso a /api/usuarios. */

const BASE = "/api/usuarios";

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

export type ListaUsuariosResult = {
  items: UsuarioDto[];
};

export const usuarioService = {
  async listar(): Promise<UsuarioDto[]> {
    const resultado = await request<ListaUsuariosResult>(BASE);
    return resultado.items;
  },

  async crear(data: UsuarioCreateInput): Promise<UsuarioDto> {
    const resultado = await request<{ usuario: UsuarioDto }>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return resultado.usuario;
  },

  async actualizar(id: string, data: UsuarioUpdateInput): Promise<UsuarioDto> {
    const resultado = await request<{ usuario: UsuarioDto }>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return resultado.usuario;
  },
};