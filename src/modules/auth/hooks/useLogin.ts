"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { sesionEstablecida } from "@/store/authReducer";
import { authService } from "../services/authService";
import type { LoginInput } from "../schemas/login.schema";

/**
 * Hook de inicio de sesión: llama a /api/auth/login, guarda el usuario en
 * Redux (persistido) y navega a /dashboard (o al `from` original).
 */
export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function iniciarSesion(data: LoginInput) {
    setLoading(true);
    setError(null);
    try {
      const { usuario } = await authService.login(data);
      dispatch(sesionEstablecida(usuario));
      const from = searchParams.get("from");
      const destino = from && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard";
      router.push(destino);
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { iniciarSesion, loading, error };
}
