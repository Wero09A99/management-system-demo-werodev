/** Nombres de eventos del sistema. Punto único de definición. */
export const EVENTOS = {
  /** Se creó una solicitud de eliminación. */
  SOLICITUD_CREADA: "solicitud.creada",
  /** Se resolvió (aprobó o rechazó) una solicitud de eliminación. */
  SOLICITUD_RESUELTA: "solicitud.resuelta",
} as const;

export type NombreEvento = (typeof EVENTOS)[keyof typeof EVENTOS];

export type SolicitudCreadaPayload = {
  solicitudId: string;
  entidadTipo: string;
};

export type SolicitudResueltaPayload = {
  solicitudId: string;
  estado: "APROBADA" | "RECHAZADA";
};

export type PayloadPorEvento = {
  "solicitud.creada": SolicitudCreadaPayload;
  "solicitud.resuelta": SolicitudResueltaPayload;
};