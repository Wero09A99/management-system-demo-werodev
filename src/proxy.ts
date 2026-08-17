import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verificarAccessToken } from "@/lib/auth/jwt";

const RUTAS_PROTEGIDAS = [
  "/dashboard",
  "/clientes",
  "/ingresos",
  "/gastos",
  "/reportes",
  "/configuracion",
  "/usuarios",
  "/solicitudes",
];

const RUTAS_PUBLICAS = ["/login"];

function esRutaProtegida(pathname: string) {
  return RUTAS_PROTEGIDAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

function esRutaPublica(pathname: string) {
  return RUTAS_PUBLICAS.includes(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    if (esRutaProtegida(pathname)) {
      const url = new URL("/login", request.url);
      if (pathname !== "/dashboard") url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const resultado = await verificarAccessToken(token);

  if (resultado.estado === "expirado") {
    // En rutas públicas (login) dejamos pasar para mostrar el motivo de expiración.
    if (esRutaPublica(pathname)) {
      return NextResponse.next();
    }
    const url = new URL("/login", request.url);
    url.searchParams.set("motivo", "expirado");
    if (pathname !== "/dashboard" && esRutaProtegida(pathname)) {
      url.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(url);
  }

  const sesionValida = resultado.estado === "valido";

  if (esRutaPublica(pathname) && sesionValida) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (esRutaProtegida(pathname) && !sesionValida) {
    const url = new URL("/login", request.url);
    if (pathname !== "/dashboard") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clientes/:path*",
    "/ingresos/:path*",
    "/gastos/:path*",
    "/reportes/:path*",
    "/configuracion/:path*",
    "/usuarios/:path*",
    "/solicitudes/:path*",
    "/login",
  ],
};
