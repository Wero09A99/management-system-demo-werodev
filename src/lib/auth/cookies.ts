import { cookies } from "next/headers";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const secure = process.env.NODE_ENV === "production";

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
};

function opciones(maxAge: number): CookieOptions {
  return { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge };
}

export async function definirCookieAccess(token: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, token, opciones(60 * 60));
}

export async function definirCookieRefresh(token: string) {
  const store = await cookies();
  store.set(REFRESH_COOKIE, token, opciones(60 * 60 * 24 * 30));
}

export async function limpiarCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function leerCookieAccess(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function leerCookieRefresh(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}