"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NombreTema } from "@/design-system/tokens/themes";
import { COOKIE_TEMA, leerTemaCookie } from "@/design-system/providers/tema";

type TemaContextValue = {
  tema: NombreTema;
  setTema: (tema: NombreTema) => void;
};

const TemaContext = createContext<TemaContextValue | null>(null);

export type ThemeProviderProps = {
  children: ReactNode;
  /** Tema inicial leído desde la cookie (server). */
  temaInicial?: string;
};

/**
 * Proveedor de temas del design-system.
 * Persiste la selección en la cookie "werodev-tema" y aplica `data-theme`
 * sobre <html>. Reemplaza next-themes.
 */
export function ThemeProvider({ children, temaInicial }: ThemeProviderProps) {
  const [tema, setTemaState] = useState<NombreTema>(() => leerTemaCookie(temaInicial));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
  }, [tema]);

  const setTema = useCallback((nuevoTema: NombreTema) => {
    setTemaState(nuevoTema);
    document.documentElement.setAttribute("data-theme", nuevoTema);
    document.cookie = `${COOKIE_TEMA}=${nuevoTema}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo(() => ({ tema, setTema }), [tema, setTema]);

  return <TemaContext.Provider value={value}>{children}</TemaContext.Provider>;
}

export function useTema(): TemaContextValue {
  const ctx = useContext(TemaContext);
  if (!ctx) {
    throw new Error("useTema debe usarse dentro de <ThemeProvider>.");
  }
  return ctx;
}
