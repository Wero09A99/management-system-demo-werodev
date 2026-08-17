import type { Metadata } from "next";
import { RequireRole } from "@/modules/auth/components/RequireRole";
import { ROLES } from "@/modules/auth/types/auth.types";
import { UsuariosListTemplate } from "@/modules/usuarios/components/templates/UsuariosListTemplate";

export const metadata: Metadata = {
  title: "Usuarios",
};

/**
 * Página de usuarios: solo ADMIN. El proxy y la API protegen además en servidor.
 */
export default function UsuariosPage() {
  return (
    <RequireRole roles={[ROLES.ADMIN]}>
      <UsuariosListTemplate />
    </RequireRole>
  );
}