import type { ApiResponse } from "@/types";
import type { ReporteData, ReporteParams } from "../types/reporte.types";

/** Servicio del módulo Reportes: único punto de acceso a /api/reportes. */

const BASE = "/api/reportes";

export const reporteService = {
  async obtener(params: ReporteParams = {}): Promise<ReporteData> {
    const searchParams = new URLSearchParams();
    if (params.desde) searchParams.set("desde", params.desde);
    if (params.hasta) searchParams.set("hasta", params.hasta);
    const qs = searchParams.toString();

    const res = await fetch(`${BASE}${qs ? `?${qs}` : ""}`, {
      headers: { "Content-Type": "application/json" },
    });
    const body = (await res.json()) as ApiResponse<ReporteData>;

    if (!res.ok) {
      throw new Error("error" in body ? body.error : "No se pudieron generar los reportes.");
    }

    if (!("data" in body)) {
      throw new Error("Respuesta inválida del servidor.");
    }

    return body.data;
  },
};