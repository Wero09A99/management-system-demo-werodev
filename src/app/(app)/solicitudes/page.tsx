import type { Metadata } from "next";
import { RequireRole } from "@/modules/auth/components/RequireRole";
import { ROLES } from "@/modules/auth/types/auth.types";
import { SolicitudesListTemplate } from "@/modules/solicitudes/components/templates/SolicitudesListTemplate";

export const metadata: Metadata = {
  title: "Solicitudes",
};

export default function SolicitudesPage() {
  return (
    <RequireRole roles={[ROLES.ADMIN, ROLES.OPERADOR]}>
      <SolicitudesListTemplate />
    </RequireRole>
  );
}