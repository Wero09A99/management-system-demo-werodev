"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/design-system/atoms/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Coincide si la ruta actual inicia con href (para grupos con subrutas). */
  exact?: boolean;
  /** Contador opcional mostrado como badge (p. ej. solicitudes pendientes). */
  badge?: number;
};

export type AppShellProps = {
  brand: string;
  groupLabel: string;
  navItems: NavItem[];
  footer?: ReactNode;
  /** Nombre del usuario autenticado (se muestra en el pie del sidebar). */
  usuarioNombre?: string;
  /** Etiqueta del rol del usuario (ej. "Administrador"). */
  usuarioRol?: string;
  children: ReactNode;
};

/**
 * Organismo AppShell: sidebar + contenido principal.
 * Agnóstico de dominio: recibe los ítems de navegación y el usuario como props.
 */
export function AppShell({
  brand,
  groupLabel,
  navItems,
  footer,
  usuarioNombre,
  usuarioRol,
  children,
}: AppShellProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Image src="/logo.png" alt={brand} width={40} height={40} />
            <span className="truncate text-lg font-semibold tracking-tight">{brand}</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active = isActive(item);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                          {item.badge != null && item.badge > 0 ? (
                            <Badge
                              variant="secondary"
                              className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5 text-xs"
                            >
                              {item.badge}
                            </Badge>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" className="cursor-default">
                <div>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                    <Image src = "/logo.png" alt = "WeroDev" width={28} height={28}></Image>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{usuarioNombre ?? "WeroDev"}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {usuarioRol ?? "Sin sesión"}
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {footer}
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className={cn("flex items-center gap-2 text-sm text-muted-foreground")}>
            {brand}
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}