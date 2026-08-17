"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { usePrefiereReducido } from "@/lib/hooks/usePrefiereReducido";
import { cn } from "@/lib/utils";

export type NubeParticulasProps = {
  /** Cantidad de partículas. */
  cantidad?: number;
  /** Color de las partículas (hex). */
  color?: string;
  /** Tamaño de cada partícula en unidades de escena. */
  tamano?: number;
  /** Radio de dispersión de la nube. */
  radio?: number;
  /** Velocidad de rotación por frame. */
  velocidad?: number;
};

/** PRNG determinista (mulberry32) para posiciones estables entre renders. */
function crearGenerador(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Escena de partículas reutilizable dentro de un <Canvas>.
 * Rota suavemente salvo que el sistema indique preferir menos movimiento.
 */
export function NubeParticulas({
  cantidad = 200,
  color = "#6ee7f9",
  tamano = 0.025,
  radio = 5,
  velocidad = 0.05,
}: NubeParticulasProps) {
  const puntosRef = useRef<THREE.Points>(null);
  const reducir = usePrefiereReducido();

  const posiciones = useMemo(() => {
    const rand = crearGenerador(cantidad * 7919 + 13);
    const arr = new Float32Array(cantidad * 3);
    for (let i = 0; i < cantidad; i++) {
      const r = radio * (0.35 + rand() * 0.65);
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [cantidad, radio]);

  useFrame((_, delta) => {
    if (!puntosRef.current || reducir) return;
    puntosRef.current.rotation.y += delta * velocidad;
  });

  return (
    <Points ref={puntosRef} positions={posiciones} stride={3} frustumCulled={false}>
      <PointMaterial transparent color={color} size={tamano} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

export type ParticleFieldCanvasProps = {
  className?: string;
  color?: string;
  cantidad?: number;
  tamano?: number;
  radio?: number;
  velocidad?: number;
};

/**
 * Organismo ParticleFieldCanvas: fondo de partículas 3D a pantalla completa
 * (ocupa el contenedor padre de forma absoluta y no intercepta clicks).
 */
export function ParticleFieldCanvas({
  className,
  color,
  cantidad,
  tamano,
  radio,
  velocidad,
}: ParticleFieldCanvasProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <NubeParticulas
          color={color}
          cantidad={cantidad}
          tamano={tamano}
          radio={radio}
          velocidad={velocidad}
        />
      </Canvas>
    </div>
  );
}