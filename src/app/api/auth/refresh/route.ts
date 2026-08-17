import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarPassword } from "@/lib/auth/bcrypt";
import {
  firmarAccessToken,
  verificarRefreshToken,
} from "@/lib/auth/jwt";
import {
  definirCookieAccess,
  leerCookieRefresh,
} from "@/lib/auth/cookies";
import { serializarUsuario } from "@/lib/auth/usuario-dto";

export async function POST() {
  try {
    const token = await leerCookieRefresh();

    if (!token) {
      return NextResponse.json(
        { error: "No hay sesión activa." },
        { status: 401 },
      );
    }

    const payload = await verificarRefreshToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Sesión inválida." },
        { status: 401 },
      );
    }

    const registro = await prisma.refreshToken.findUnique({
      where: { id: payload.jti },
      include: { usuario: true },
    });

    if (
      !registro ||
      registro.revoked ||
      registro.expiresAt.getTime() < Date.now() ||
      !registro.usuario.activo
    ) {
      return NextResponse.json(
        { error: "Sesión expirada o revocada." },
        { status: 401 },
      );
    }

    const hashValido = await verificarPassword(token, registro.tokenHash);
    if (!hashValido) {
      return NextResponse.json(
        { error: "Sesión inválida." },
        { status: 401 },
      );
    }

    const accessToken = await firmarAccessToken({
      sub: registro.usuario.id,
      rol: registro.usuario.rol,
      nombre: registro.usuario.nombre,
    });

    await definirCookieAccess(accessToken);

    return NextResponse.json({
      data: { usuario: serializarUsuario(registro.usuario) },
    });
  } catch (error) {
    console.error("POST /api/auth/refresh:", error);
    return NextResponse.json(
      { error: "No se pudo renovar la sesión." },
      { status: 500 },
    );
  }
}