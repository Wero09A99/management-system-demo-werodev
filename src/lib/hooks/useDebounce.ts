"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook compartido: devuelve el valor tras `delay` ms de inactividad.
 * Útil para búsquedas con debounce.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, delay]);

  return debounced;
}