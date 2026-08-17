import type { UsuarioModel } from "@/generated/prisma/models/Usuario";

export type UsuarioDto = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  ultimoLogin: string | null;
};

export function serializarUsuario(usuario: UsuarioModel): UsuarioDto {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: usuario.activo,
    ultimoLogin: usuario.ultimoLogin?.toISOString() ?? null,
  };
}