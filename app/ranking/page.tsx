"use client";

import { RankingUbicacionPicker, type UbicacionRanking } from "@/components/ranking/RankingUbicacionPicker";
import { ShareRetoButtons } from "@/components/share/ShareRetoButtons";
import { MobileShell } from "@/components/ui/MobileShell";
import { usePlayerSession } from "@/lib/use-player-session";
import { getCompletedRound } from "@/lib/round";
import { getPlayerSession } from "@/lib/session";
import { useRoundComplete } from "@/lib/use-round-complete";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

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

type Ubicacion = Pick<UbicacionRanking, "departamento" | "municipio" | "colegio">;

function subtituloRanking(scope: Scope, ubicacion: Ubicacion | null): string {
  if (scope === "nacional") return "Top colegios · Colombia";
  if (!ubicacion) return "Elige un colegio para comparar";
  if (scope === "colegio") return ubicacion.colegio;
  if (scope === "municipio") return `${ubicacion.municipio}, ${ubicacion.departamento}`;
  return ubicacion.departamento;
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
  if (scope === "nacional") return `${f.puntaje}/500`;
  return `${f.puntaje}/500`;
}

function posicionRanking(index: number): string {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return String(index + 1);
}

const TABS: { id: Scope; label: string }[] = [
  { id: "colegio", label: "Mi colegio" },
  { id: "municipio", label: "Municipio" },
  { id: "departamento", label: "Departamento" },
  { id: "nacional", label: "Nacional" },
];

function esScopeValido(v: string | null): v is Scope {
  return v === "colegio" || v === "municipio" || v === "departamento" || v === "nacional";
}

function scopeInicial(scopeUrl: string | null): Scope {
  if (esScopeValido(scopeUrl)) return scopeUrl;
  return "nacional";
}

function RankingContent() {
  const searchParams = useSearchParams();
  const scopeUrl = searchParams.get("scope");
  const session = usePlayerSession();
  const rondaCompleta = useRoundComplete();
  const [scope, setScope] = useState<Scope>(() => scopeInicial(scopeUrl));
  const [explorando, setExplorando] = useState<UbicacionRanking | null>(null);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ubicacion = useMemo<Ubicacion | null>(() => {
    if (session) {
      return {
        departamento: session.departamento,
        municipio: session.municipio,
        colegio: session.colegio,
      };
    }
    return explorando;
  }, [session, explorando]);

  useEffect(() => {
    if (esScopeValido(scopeUrl)) {
      setScope(scopeUrl);
      return;
    }
    if (getPlayerSession()) setScope("colegio");
  }, [scopeUrl]);

  const cargarRanking = useCallback(async () => {
    if (scope !== "nacional" && !ubicacion) {
      setFilas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = new URLSearchParams({ scope });
    if (ubicacion) {
      q.set("departamento", ubicacion.departamento);
      q.set("municipio", ubicacion.municipio);
      q.set("colegio", ubicacion.colegio);
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
  }, [scope, ubicacion]);

  useEffect(() => {
    void cargarRanking();
  }, [cargarRanking]);

  const necesitaColegio = scope !== "nacional" && !ubicacion;
  const esVisitante = !session;

  return (
    <MobileShell
      title="Ranking"
      subtitle={subtituloRanking(scope, ubicacion)}
      backHref={rondaCompleta ? undefined : "/"}
    >
      {esVisitante && scope === "nacional" ? (
        <p className="mb-3 text-sm text-slate-400">
          Mira el top nacional o busca tu colegio en la pestaña <strong className="text-slate-300">Mi colegio</strong>.
        </p>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setScope(t.id)}
            className={`rounded-xl px-3 py-2.5 text-center text-sm font-medium leading-tight ${
              scope === t.id ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {necesitaColegio ? (
        <>
          <p className="mb-3 text-sm text-amber-200/90">
            Elige un colegio para ver su ranking local (no necesitas jugar aún).
          </p>
          <RankingUbicacionPicker
            onSeleccionar={(u) => {
              setExplorando(u);
            }}
          />
          <Link
            href="/onboarding"
            className="mt-4 block text-center text-sm text-indigo-400 underline-offset-2 hover:underline"
          >
            ¿Vas a jugar? Configura tu apodo →
          </Link>
        </>
      ) : (
        <>
          {!session && explorando && scope !== "nacional" ? (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-slate-800/60 px-3 py-2 text-xs">
              <span className="truncate text-slate-400">
                Viendo: <span className="text-slate-200">{explorando.colegio}</span>
              </span>
              <button
                type="button"
                onClick={() => setExplorando(null)}
                className="shrink-0 font-medium text-indigo-400"
              >
                Cambiar
              </button>
            </div>
          ) : null}

          {scope === "nacional" ? (
            <p className="mb-3 text-xs text-slate-500">
              Promedio de puntaje global (0–500) por colegio en Colombia.
            </p>
          ) : null}

          {loading ? (
            <p className="text-slate-400">Cargando ranking…</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : filas.length === 0 ? (
            <div className="space-y-3 text-center">
              <p className="text-slate-500">Aún no hay puntajes aquí. ¡Sé el primero!</p>
              <Link
                href="/onboarding"
                className="inline-block rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white"
              >
                Jugar ahora
              </Link>
            </div>
          ) : (
            <ol className="space-y-2">
              {filas.map((f, i) => {
                const detalle = detalleFila(f, scope);
                return (
                  <li
                    key={`${f.departamento ?? ""}-${f.municipio ?? ""}-${f.apodo}-${i}`}
                    className="flex items-center gap-3 rounded-xl bg-slate-800/80 px-4 py-3"
                  >
                    <span
                      className={`flex w-8 shrink-0 items-center justify-center font-bold text-indigo-400 ${
                        i < 3 ? "text-xl" : "text-lg"
                      }`}
                    >
                      {posicionRanking(i)}
                    </span>
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
        </>
      )}

      {rondaCompleta ? (
        <div className="mt-6">
          <ShareRetoButtons
            puntaje={getCompletedRound()?.puntaje}
            apodo={session?.apodo}
            colegio={session?.colegio}
          />
        </div>
      ) : null}
    </MobileShell>
  );
}

export default function RankingPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-slate-400">Cargando ranking…</p>}>
      <RankingContent />
    </Suspense>
  );
}
