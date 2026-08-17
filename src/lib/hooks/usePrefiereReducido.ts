"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function suscribirse(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function obtenerReducido() {
  return window.matchMedia(QUERY).matches;
}

function obtenerReducidoSSR() {
  return false;
}

/**
 * Hook: detecta `prefers-reduced-motion` del sistema operativo.
 * Devuelve true si el usuario prefiere menos movimiento (se usa para
 * desactivar rotaciones automáticas de la gráfica galaxia).
 */
export function usePrefiereReducido(): boolean {
  return useSyncExternalStore(suscribirse, obtenerReducido, obtenerReducidoSSR);
}