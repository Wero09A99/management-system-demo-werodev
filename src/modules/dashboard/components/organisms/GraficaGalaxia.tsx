"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { ChartNoAxesCombined, Gauge, Orbit, Pause, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { EmptyState } from "@/design-system/organisms/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NubeParticulas } from "@/design-system/organisms/ParticleFieldCanvas";
import { GraficaMensual } from "@/modules/dashboard/components/organisms/GraficaMensual";
import { usePrefiereReducido } from "@/lib/hooks/usePrefiereReducido";
import { useTema } from "@/design-system/providers/ThemeProvider";
import { temaGalaxia } from "@/design-system/tokens/themes";
import { formatMoney } from "@/lib/utils";
import type { PuntoMensual } from "@/modules/dashboard/types/dashboard.types";

export type GraficaGalaxiaProps = {
  data?: PuntoMensual[];
  loading?: boolean;
};

type Barras3DProps = {
  data: PuntoMensual[];
  colorIngresos: string;
  colorGastos: string;
  pausado?: boolean;
};

const ALTURA_MAXIMA = 3.5;
const FRACCIONES = [0, 0.25, 0.5, 0.75, 1] as const;

/** Escala de referencia 3D: líneas de cuadrícula horizontales con etiquetas de monto. */
function Escala3D({ data, anchoGrupo }: { data: PuntoMensual[]; anchoGrupo: number }) {
  const maximo = Math.max(1, ...data.map((p) => Math.max(p.ingresos, p.gastos)));
  const inicio = -((data.length - 1) * anchoGrupo) / 2;
  const anchoTotal = Math.max(4, data.length * anchoGrupo);
  const colorLinea = "rgba(108, 142, 255, 0.25)";

  return (
    <group>
      {FRACCIONES.map((fraccion) => {
        const y = fraccion * ALTURA_MAXIMA;
        return (
          <group key={fraccion}>
            <mesh position={[0, y, 0]}>
              <boxGeometry args={[anchoTotal, 0.01, 0.01]} />
              <meshBasicMaterial color={colorLinea} transparent opacity={0.6} />
            </mesh>
            <Html
              position={[inicio - 0.9, y, 0]}
              center
              style={{ pointerEvents: "none" }}
            >
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                {formatMoney(maximo * fraccion, "MXN", "es-MX").replace(",", ".")}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/** Leyenda HTML superpuesta: colores de ingreso y gasto. */
function Leyenda3D({ colorIngresos, colorGastos }: { colorIngresos: string; colorGastos: string }) {
  return (
    <div className="pointer-events-none absolute right-3 top-2 z-10 flex items-center gap-3 rounded-md border bg-background/70 px-2.5 py-1.5 text-xs backdrop-blur">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: colorIngresos }} />
        Ingresos
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: colorGastos }} />
        Gastos
      </span>
    </div>
  );
}

function Barras3D({ data, colorIngresos, colorGastos, pausado }: Barras3DProps) {
  const grupoRef = useRef<THREE.Group>(null);
  const reducir = usePrefiereReducido();
  const maximo = Math.max(1, ...data.map((p) => Math.max(p.ingresos, p.gastos)));
  const anchoGrupo = 1.4;
  const inicio = -((data.length - 1) * anchoGrupo) / 2;

  useFrame((_, delta) => {
    if (!grupoRef.current || reducir || pausado) return;
    grupoRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={grupoRef}>
      <NubeParticulas
        cantidad={220}
        color={temaGalaxia.colores.acento2}
        tamano={0.03}
        radio={6}
        velocidad={0.03}
      />
      <Escala3D data={data} anchoGrupo={anchoGrupo} />
      {data.map((punto, i) => {
        const x = inicio + i * anchoGrupo;
        const altoIngresos = (punto.ingresos / maximo) * ALTURA_MAXIMA + 0.05;
        const altoGastos = (punto.gastos / maximo) * ALTURA_MAXIMA + 0.05;

        return (
          <group key={punto.mes} position={[x, 0, 0]}>
            <mesh position={[-0.28, altoIngresos / 2, 0]}>
              <boxGeometry args={[0.45, altoIngresos, 0.45]} />
              <meshStandardMaterial color={colorIngresos} emissive={colorIngresos} emissiveIntensity={0.15} />
            </mesh>
            <mesh position={[0.28, altoGastos / 2, 0]}>
              <boxGeometry args={[0.45, altoGastos, 0.45]} />
              <meshStandardMaterial color={colorGastos} emissive={colorGastos} emissiveIntensity={0.15} />
            </mesh>
            <Html position={[0, -0.15, 0]} center style={{ pointerEvents: "none" }}>
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                {punto.etiqueta}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function CanvasGrafica3D({ data, colorIngresos, colorGastos, pausado }: Barras3DProps) {
  const reducir = usePrefiereReducido();

  return (
    <Canvas
      camera={{ position: [0, 5.5, 9], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 8, 5]} intensity={1.2} />
      <directionalLight position={[-4, 3, -5]} intensity={0.4} />

      <Barras3D
        data={data}
        colorIngresos={colorIngresos}
        colorGastos={colorGastos}
        pausado={pausado}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={20}
        target={[0, 1.5, 0]}
        autoRotate={!reducir && !pausado}
        autoRotateSpeed={1.2}
      />
    </Canvas>
  );
}

/** Detecta si WebGL está disponible (para decidir el fallback 2D). */
function detectarWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Organismo GraficaGalaxia: barras 3D con campo de partículas para el tema
 * Galaxia. Si el tema no es galaxia (o el usuario elige la vista simple)
 * cae a la gráfica 2D de recharts. Sin WebGL también usa el fallback 2D.
 */
export function GraficaGalaxia({ data, loading }: GraficaGalaxiaProps) {
  const { tema } = useTema();
  const [verSimple, setVerSimple] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [webGL] = useState(detectarWebGL);

  const colorIngresos = temaGalaxia.colores.acento;
  const colorGastos = temaGalaxia.colores.acento3;

  const usar3D = tema === "galaxia" && !verSimple && webGL;

  if (!usar3D) {
    const puedeVolver3D = tema === "galaxia" && webGL;
    return (
      <GraficaMensual
        data={data}
        loading={loading}
        action={
          puedeVolver3D ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerSimple(false)}
              disabled={loading}
            >
              <Icon icon={Orbit} />
              Ver en 3D
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Movimiento mensual</CardTitle>
            <CardDescription>
              Ingresos y gastos de los últimos 6 meses (arrastra para girar)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPausado((p) => !p)}
              disabled={loading}
              aria-label={pausado ? "Reanudar giro de la gráfica" : "Pausar giro de la gráfica"}
            >
              <Icon icon={pausado ? Play : Pause} />
              {pausado ? "Reanudar" : "Pausar giro"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerSimple(true)}
              disabled={loading}
            >
              <Icon icon={ChartNoAxesCombined} />
              Ver como gráfica simple
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : data && data.length > 0 ? (
          <div className="relative h-[280px] w-full">
            <Leyenda3D colorIngresos={colorIngresos} colorGastos={colorGastos} />
            <CanvasGrafica3D
              data={data}
              colorIngresos={colorIngresos}
              colorGastos={colorGastos}
              pausado={pausado}
            />
          </div>
        ) : (
          <EmptyState
            icon={Gauge}
            title="Sin datos para mostrar."
            description="Registra ingresos o gastos para ver la tendencia mensual."
            className="border-0 bg-muted/30 py-10"
          />
        )}
      </CardContent>
    </Card>
  );
}