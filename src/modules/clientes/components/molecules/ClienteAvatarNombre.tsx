import { Avatar } from "@/design-system/atoms/avatar";

export type ClienteAvatarNombreProps = {
  nombre: string;
  empresa?: string | null;
};

/**
 * Molécula de dominio: avatar con iniciales + nombre del cliente.
 */
export function ClienteAvatarNombre({ nombre, empresa }: ClienteAvatarNombreProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={nombre} />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-medium text-foreground">{nombre}</p>
        {empresa ? <p className="truncate text-xs text-muted-foreground">{empresa}</p> : null}
      </div>
    </div>
  );
}