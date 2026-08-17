import type { ApiResponse } from "@/types";
import { EVENTOS, eventBus } from "@/lib/events/eventBus";
import type {
  Solicitud,
  SolicitudCreateInput,
  SolicitudListadoParams,
  SolicitudResolucionInput,
} from "../types/solicitud.types";

/** Servicio del módulo Solicitudes: único punto de acceso a /api/solicitudes-eliminacion. */

const BASE = "/api/solicitudes-eliminacion";

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

export type ListaSolicitudesResult = {
  items: Solicitud[];
  total: number;
  page: number;
  pageSize: number;
};

export const solicitudService = {
  async listar(params: SolicitudListadoParams = {}): Promise<ListaSolicitudesResult> {
    const searchParams = new URLSearchParams();
    if (params.estado) searchParams.set("estado", params.estado);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    const qs = searchParams.toString();
    return request<ListaSolicitudesResult>(`${BASE}${qs ? `?${qs}` : ""}`);
  },

  async crear(data: SolicitudCreateInput): Promise<Solicitud> {
    const solicitud = await request<Solicitud>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Punto de extensión del event bus (sin suscriptores por ahora).
    eventBus.emit(EVENTOS.SOLICITUD_CREADA, {
      solicitudId: solicitud.id,
      entidadTipo: solicitud.entidadTipo,
    });
    return solicitud;
  },

  async resolver(id: string, data: SolicitudResolucionInput): Promise<Solicitud> {
    const solicitud = await request<Solicitud>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    // Punto de extensión del event bus (sin suscriptores por ahora).
    eventBus.emit(EVENTOS.SOLICITUD_RESUELTA, {
      solicitudId: solicitud.id,
      estado: solicitud.estado === "PENDIENTE" ? "RECHAZADA" : solicitud.estado,
    });
    return solicitud;
  },
};