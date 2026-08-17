import type { ApiResponse } from "@/types";
import type { DashboardData } from "../types/dashboard.types";

/** Servicio del módulo Dashboard: único punto de acceso a /api/dashboard. */

const BASE = "/api/dashboard";

export const dashboardService = {
  async obtener(): Promise<DashboardData> {
    const res = await fetch(BASE, { headers: { "Content-Type": "application/json" } });
    const body = (await res.json()) as ApiResponse<DashboardData>;

    if (!res.ok) {
      throw new Error("error" in body ? body.error : "No se pudieron cargar los datos.");
    }

    if (!("data" in body)) {
      throw new Error("Respuesta inválida del servidor.");
    }

    return body.data;
  },
};