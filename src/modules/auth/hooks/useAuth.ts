"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { marcadaHidratada, sesionEstablecida } from "@/store/authReducer";
import { authService } from "../services/authService";
import type { Rol } from "../types/auth.types";

/**
 * Hook de sesión: lee el usuario actual y su rol desde el store de Redux
 * (persistido con redux-persist). En la primera carga intenta rehidratar
 * desde `/api/auth/me` por si el localStorage no coincide con las cookies.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const usuario = useAppSelector((state) => state.auth.usuario);
  const hidratado = useAppSelector((state) => state.auth.hidratado);

  useEffect(() => {
    if (hidratado) return;

    let activo = true;
    void (async () => {
      try {
        const usuario = await authService.me();
        if (activo) dispatch(sesionEstablecida(usuario));
      } catch {
        if (activo) dispatch(marcadaHidratada());
      }
    })();

    return () => {
      activo = false;
    };
  }, [dispatch, hidratado]);

  return {
    usuario,
    rol: (usuario?.rol ?? null) as Rol | null,
    hidratado,
  };
}
