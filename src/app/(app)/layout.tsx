"use client";

import { AppShell, type NavItem } from "@/design-system/organisms/app-shell";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { useSolicitudesPendientes } from "@/modules/solicitudes/hooks/useSolicitudesPendientes";
import { ROLES, type Rol } from "@/modules/auth/types/auth.types";
import { ROL_LABELS } from "@/modules/usuarios/types/usuario.types";
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  ClipboardList,
  LogOut,
} from "lucide-react";

type NavItemConRol = NavItem & {
  roles: readonly Rol[];
};

const NAV_ITEMS: NavItemConRol[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true, roles: [ROLES.ADMIN, ROLES.OPERADOR, ROLES.CONSULTA] },
  { href: "/clientes", label: "Clientes", icon: Users, roles: [ROLES.ADMIN, ROLES.OPERADOR, ROLES.CONSULTA] },
  { href: "/ingresos", label: "Ingresos", icon: ArrowDownCircle, roles: [ROLES.ADMIN, ROLES.OPERADOR, ROLES.CONSULTA] },
  { href: "/gastos", label: "Gastos", icon: ArrowUpCircle, roles: [ROLES.ADMIN, ROLES.OPERADOR, ROLES.CONSULTA] },
  { href: "/reportes", label: "Reportes", icon: BarChart3, roles: [ROLES.ADMIN, ROLES.OPERADOR, ROLES.CONSULTA] },
  { href: "/solicitudes", label: "Solicitudes", icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.OPERADOR] },
  { href: "/usuarios", label: "Usuarios", icon: Users, roles: [ROLES.ADMIN] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { usuario, rol } = useAuth();
  const { cerrarSesion, loading } = useLogout();
  const solicitudesPendientes = useSolicitudesPendientes();
  const puedeVerSolicitudes = rol && NAV_ITEMS.find((i) => i.href === "/solicitudes")?.roles.includes(rol);

  const navItems: NavItem[] = rol
    ? NAV_ITEMS.filter((item) => item.roles.includes(rol)).map((item) => ({
        href: item.href,
        label: item.label,
        icon: item.icon,
        exact: item.exact,
        badge:
          item.href === "/solicitudes" && puedeVerSolicitudes
            ? solicitudesPendientes.pendientes
            : undefined,
      }))
    : [];

  const footer = (
    <div className="grid gap-1 px-2 py-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => void cerrarSesion()}
        disabled={loading}
      >
        <Icon icon={LogOut} />
        Cerrar sesión
      </Button>
    </div>
  );

  return (
    <AppShell
      brand="WeroDev"
      groupLabel="Navegación"
      navItems={navItems}
      footer={footer}
      usuarioNombre={usuario?.nombre}
      usuarioRol={rol ? ROL_LABELS[rol] ?? rol : undefined}
    >
      {children}
    </AppShell>
  );
}