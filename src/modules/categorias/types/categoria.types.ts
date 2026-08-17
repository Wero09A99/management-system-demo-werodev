export type CategoriaResumen = {
  id: string;
  nombre: string;
  tipo: "INGRESO" | "GASTO";
  color: string | null;
  activa: boolean;
};

/** Etiquetas para mostrar el tipo de categoría. */
export const TIPO_CATEGORIA_LABELS: Record<CategoriaResumen["tipo"], string> = {
  INGRESO: "Ingreso",
  GASTO: "Gasto",
};
