"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/design-system/atoms/spinner";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Rol } from "@/modules/auth/types/auth.types";

export type RequireRoleProps = {
  /** Roles permitidos para acceder al contenido. */
  roles: readonly Rol[];
  children: ReactNode;
  /** Ruta a la que redirigir si el usuario no tiene el rol requerido. */
  redirectTo?: string;
};

/**
 * Guard de frontend: protege contenido por rol. Si no hay sesión navega a /login;
 * si la sesión no tiene el rol requerido navega a `redirectTo` (por defecto /dashboard).
 * La seguridad real se valida además en el servidor (proxy + API routes).
 */
export function RequireRole({ roles, children, redirectTo = "/dashboard" }: RequireRoleProps) {
  const router = useRouter();
  const { usuario, rol, hidratado } = useAuth();

  useEffect(() => {
    if (!hidratado) return;

    if (!usuario) {
      router.replace(`/login?from=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (rol && !roles.includes(rol)) {
      router.replace(redirectTo);
    }
  }, [hidratado, usuario, rol, roles, redirectTo, router]);

  if (!hidratado) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (!usuario || !rol || !roles.includes(rol)) {
    return null;
  }

  return <>{children}</>;
}
