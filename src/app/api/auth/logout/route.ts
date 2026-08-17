import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarRefreshToken } from "@/lib/auth/jwt";
import { limpiarCookies, leerCookieRefresh } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const token = await leerCookieRefresh();

    if (token) {
      const payload = await verificarRefreshToken(token);
      if (payload) {
        await prisma.refreshToken.updateMany({
          where: { id: payload.jti, revoked: false },
          data: { revoked: true },
        });
      }
    }

    await limpiarCookies();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/logout:", error);
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión." },
      { status: 500 },
    );
  }
}