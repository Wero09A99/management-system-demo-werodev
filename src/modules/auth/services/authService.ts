import type { ApiResponse } from "@/types";
import type { UsuarioDto } from "@/lib/auth/usuario-dto";
import type { LoginInput } from "../schemas/login.schema";

export type LoginResponse = {
  usuario: UsuarioDto;
  expiraRefreshEn: number;
};

/** Servicio del módulo auth: único punto de acceso a /api/auth. */
export const authService = {
  async login(data: LoginInput): Promise<LoginResponse> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = (await res.json()) as ApiResponse<LoginResponse>;
    if (!res.ok) {
      throw new Error("error" in body ? body.error : "No se pudo iniciar sesión.");
    }
    if (!("data" in body)) {
      throw new Error("Respuesta inválida del servidor.");
    }
    return body.data;
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
  },

  async me(): Promise<UsuarioDto> {
    const res = await fetch("/api/auth/me");
    const body = (await res.json()) as ApiResponse<{ usuario: UsuarioDto }>;
    if (!res.ok) {
      throw new Error("error" in body ? body.error : "No autenticado.");
    }
    if (!("data" in body)) {
      throw new Error("Respuesta inválida del servidor.");
    }
    return body.data.usuario;
  },
};
