"use client";

import { Moon, Sparkles, Sun } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { useTema } from "@/design-system/providers/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { temaClaro, temaOscuro, temaGalaxia } from "@/design-system/tokens/themes";

const TEMAS = [
  { valor: temaClaro.nombre, etiqueta: temaClaro.etiqueta, icono: Sun },
  { valor: temaOscuro.nombre, etiqueta: temaOscuro.etiqueta, icono: Moon },
  { valor: temaGalaxia.nombre, etiqueta: temaGalaxia.etiqueta, icono: Sparkles },
] as const;

/**
 * Átomo ThemeToggle: selector de tema (claro, oscuro, galaxia).
 * Usa el ThemeProvider del design-system (cookie + data-theme).
 */
export function ThemeToggle() {
  const { tema, setTema } = useTema();

  const actual = TEMAS.find((t) => t.valor === tema) ?? TEMAS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Cambiar tema"
          title={actual.etiqueta}
        >
          <Icon icon={actual.icono} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {TEMAS.map((temaItem) => (
          <DropdownMenuItem
            key={temaItem.valor}
            onClick={() => setTema(temaItem.valor)}
          >
            <Icon icon={temaItem.icono} />
            {temaItem.etiqueta}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}