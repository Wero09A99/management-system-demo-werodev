export const TIPO_ENTIDAD_SOLICITUD = {
  INGRESO: "INGRESO",
  GASTO: "GASTO",
} as const;

export type TipoEntidadSolicitud = (typeof TIPO_ENTIDAD_SOLICITUD)[keyof typeof TIPO_ENTIDAD_SOLICITUD];

export const ESTADO_SOLICITUD = {
  PENDIENTE: "PENDIENTE",
  APROBADA: "APROBADA",
  RECHAZADA: "RECHAZADA",
} as const;

export type EstadoSolicitud = (typeof ESTADO_SOLICITUD)[keyof typeof ESTADO_SOLICITUD];

export type EntidadDetalleSolicitud = {
  concepto: string;
  monto: number;
  fecha: string;
  cliente: { id: string; nombre: string; empresa: string | null } | null;
  categoria: { id: string; nombre: string; color: string | null } | null;
};

export type Solicitud = {
  id: string;
  entidadTipo: TipoEntidadSolicitud;
  entidadId: string;
  motivo: string;
  estado: EstadoSolicitud;
  comentario: string | null;
  resueltoEn: string | null;
  createdAt: string;
  solicitante: {
    id: string;
    nombre: string;
    correo: string;
  };
  resueltoPor: {
    id: string;
    nombre: string;
  } | null;
  /** Descripción de la entidad objetivo (p. ej. concepto del ingreso/gasto). */
  entidadDescripcion: string | null;
  /** Detalle completo de la entidad (con Cliente y Categoría) para ADMIN. */
  entidadDetalle: EntidadDetalleSolicitud | null;
};

export type SolicitudCreateInput = {
  entidadTipo: TipoEntidadSolicitud;
  entidadId: string;
  motivo: string;
};

export type SolicitudResolucionInput = {
  accion: "APROBAR" | "RECHAZAR";
  comentario?: string;
};

export type SolicitudListadoParams = {
  estado?: EstadoSolicitud;
  page?: number;
  pageSize?: number;
};