import { SignJWT, jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET ?? "");
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET ?? "");

export type AccessTokenPayload = {
  sub: string;
  rol: string;
  nombre: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

/**
 * Resultado de la verificación del access token.
 * `estado: "expirado"` solo ocurre cuando la firma es válida pero el token venció.
 */
export type VerificacionAccessToken =
  | { estado: "valido"; payload: AccessTokenPayload }
  | { estado: "expirado" }
  | { estado: "invalido" };

export async function firmarAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(accessSecret);
}

export async function firmarRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(refreshSecret);
}

/**
 * Verifica el access token distinguiendo token expirado (firma válida pero vencido)
 * de token inválido. jose valida automáticamente `exp` y lanza `JWTExpired`.
 */
export async function verificarAccessToken(token: string): Promise<VerificacionAccessToken> {
  try {
    const { payload } = await jwtVerify(token, accessSecret, { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.rol !== "string") {
      return { estado: "invalido" };
    }
    return {
      estado: "valido",
      payload: {
        sub: payload.sub,
        rol: payload.rol,
        nombre: typeof payload.nombre === "string" ? payload.nombre : "",
      },
    };
  } catch (error) {
    if (error instanceof JWTExpired) {
      return { estado: "expirado" };
    }
    return { estado: "invalido" };
  }
}

export async function verificarRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret, { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.jti !== "string") return null;
    return { sub: payload.sub, jti: payload.jti };
  } catch {
    return null;
  }
}
