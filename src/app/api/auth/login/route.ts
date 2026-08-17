import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verificarPassword } from "@/lib/auth/bcrypt";
import {
  firmarAccessToken,
  firmarRefreshToken,
} from "@/lib/auth/jwt";
import {
  definirCookieAccess,
  definirCookieRefresh,
} from "@/lib/auth/cookies";
import { serializarUsuario } from "@/lib/auth/usuario-dto";
import { refreshTokenDurationMs, REFRESH_DIAS } from "@/lib/auth/constantes";

const loginSchema = z.object({
  correo: z.string().trim().email("Correo inválido.").toLowerCase(),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const { correo, password } = parsed.data;

    const usuario = await prisma.usuario.findUnique({ where: { correo } });
    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 },
      );
    }

    const passwordValida = await verificarPassword(password, usuario.passwordHash);
    if (!passwordValida) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 },
      );
    }

    const accessToken = await firmarAccessToken({
      sub: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
    });

    const jti = crypto.randomUUID();
    const refreshToken = await firmarRefreshToken({ sub: usuario.id, jti });
    const tokenHash = await hashPassword(refreshToken);

    await prisma.refreshToken.create({
      data: {
        id: jti,
        usuarioId: usuario.id,
        tokenHash,
        expiresAt: new Date(Date.now() + refreshTokenDurationMs),
      },
    });

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() },
    });

    await definirCookieAccess(accessToken);
    await definirCookieRefresh(refreshToken);

    return NextResponse.json({
      data: {
        usuario: serializarUsuario(usuario),
        expiraRefreshEn: REFRESH_DIAS,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 500 },
    );
  }
}