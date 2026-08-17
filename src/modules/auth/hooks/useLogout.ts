"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { sesionCerrada } from "@/store/authReducer";
import { authService } from "../services/authService";

/**
 * Hook de cierre de sesión: limpia las cookies en el servidor, vacía el
 * estado de Redux (persistido) y navega a /login.
 */
export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  async function cerrarSesion() {
    setLoading(true);
    try {
      await authService.logout();
    } catch {
      // Aún con error en el servidor, cerramos la sesión local.
    } finally {
      dispatch(sesionCerrada());
      router.push("/login");
      router.refresh();
      setLoading(false);
    }
  }

  return { cerrarSesion, loading };
}
