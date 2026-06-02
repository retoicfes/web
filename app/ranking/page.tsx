"use client";

import { MobileShell } from "@/components/ui/MobileShell";
import { usePlayerSession } from "@/lib/use-player-session";
import { useCallback, useEffect, useState } from "react";

type Scope = "colegio" | "municipio" | "departamento" | "nacional";
type Fila = {
  apodo: string;
  puntaje: number;
  departamento?: string;
  municipio?: string;
  colegio?: string;
  promedio?: number;
  jugadores?: number;
};

function subtituloRanking(
  scope: Scope,
  session: { departamento: string; municipio: string; colegio: string } | null,
): string {
  if (scope === "nacional") return "Top colegios · Colombia";
  if (!session) return "Compite con tu salón";
  if (scope === "colegio") return session.colegio;
  if (scope === "municipio") return `${session.municipio}, ${session.departamento}`;
  return session.departamento;
}

function detalleFila(f: Fila, scope: Scope): string | null {
  if (scope === "municipio" && f.colegio) return f.colegio;
  if (scope === "departamento") {
    const partes = [f.municipio, f.colegio].filter(Boolean);
    return partes.length > 0 ? partes.join(" · ") : null;
  }
  if (scope === "nacional") {
    const partes = [f.municipio, f.departamento].filter(Boolean);
    const ubicacion = partes.length > 0 ? partes.join(" · ") : null;
    if (ubicacion && f.jugadores && f.jugadores > 0) {
      return `${ubicacion} · ${f.jugadores} jugador${f.jugadores === 1 ? "" : "es"}`;
    }
    return ubicacion;
  }
  return null;
}

function etiquetaPuntos(f: Fila, scope: Scope): string {
  if (scope === "nacional") return `${f.puntaje} prom.`;
  return `${f.promedio ?? f.puntaje} pts`;
}

export default function RankingPage() {
  const session = usePlayerSession();
  const [scope, setScope] = useState<Scope>("colegio");
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarRanking = useCallback(async () => {
    if (!session && scope !== "nacional") {
      setFilas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = new URLSearchParams({ scope });
    if (session) {
      q.set("departamento", session.departamento);
      q.set("municipio", session.municipio);
      q.set("colegio", session.colegio);
    }

    try {
      const res = await fetch(`/api/rankings?${q}`);
      if (!res.ok) throw new Error("No se pudo cargar el ranking");
      const d = (await res.json()) as { ranking: Fila[] };
      setFilas(d.ranking ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
      setFilas([]);
    } finally {
      setLoading(false);
    }
  }, [scope, session]);

  useEffect(() => {
    void cargarRanking();
  }, [cargarRanking]);

  const tabs: { id: Scope; label: string }[] = [
    { id: "colegio", label: "Mi colegio" },
    { id: "municipio", label: "Municipio" },
    { id: "departamento", label: "Departamento" },
    { id: "nacional", label: "Nacional" },
  ];

  return (
    <MobileShell title="Ranking" subtitle={subtituloRanking(scope, session)} backHref="/">
      {!session && scope !== "nacional" ? (
        <p className="text-sm text-amber-300">
          Juega una ronda primero para ver rankings filtrados a tu ubicación.
        </p>
      ) : null}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setScope(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              scope === t.id ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {scope === "nacional" ? (
        <p className="mb-3 text-xs text-slate-500">
          Promedio de puntos por colegio en todo el país.
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-400">Cargando ranking…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : filas.length === 0 ? (
        <p className="text-slate-500">Aún no hay puntajes. ¡Sé el primero!</p>
      ) : (
        <ol className="space-y-2">
          {filas.map((f, i) => {
            const detalle = detalleFila(f, scope);
            return (
              <li
                key={`${f.departamento ?? ""}-${f.municipio ?? ""}-${f.apodo}-${i}`}
                className="flex items-center gap-3 rounded-xl bg-slate-800/80 px-4 py-3"
              >
                <span className="w-6 text-lg font-bold text-indigo-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">{f.apodo}</p>
                  {detalle ? (
                    <p className="truncate text-xs text-slate-500">{detalle}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-right text-sm font-bold text-green-400">
                  {etiquetaPuntos(f, scope)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </MobileShell>
  );
}
