"use client";

import { MobileShell } from "@/components/ui/MobileShell";
import { usePlayerSession } from "@/lib/use-player-session";
import { useCallback, useEffect, useState } from "react";

type Scope = "departamento" | "municipio" | "colegio";
type Fila = { apodo: string; puntaje: number; colegio?: string; promedio?: number };

export default function RankingPage() {
  const session = usePlayerSession();
  const [scope, setScope] = useState<Scope>("colegio");
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarRanking = useCallback(async () => {
    if (!session) {
      setFilas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = new URLSearchParams({
      scope,
      departamento: session.departamento,
      municipio: session.municipio,
      colegio: session.colegio,
    });

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
  ];

  return (
    <MobileShell title="Ranking" subtitle="Compite con tu salón" backHref="/">
      {!session ? (
        <p className="text-sm text-amber-300">
          Juega una ronda primero para ver rankings filtrados a tu ubicación.
        </p>
      ) : null}

      <div className="mb-4 flex gap-2 overflow-x-auto">
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

      {loading ? (
        <p className="text-slate-400">Cargando ranking…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : filas.length === 0 ? (
        <p className="text-slate-500">Aún no hay puntajes. ¡Sé el primero!</p>
      ) : (
        <ol className="space-y-2">
          {filas.map((f, i) => (
            <li
              key={`${f.apodo}-${i}`}
              className="flex items-center gap-3 rounded-xl bg-slate-800/80 px-4 py-3"
            >
              <span className="w-6 text-lg font-bold text-indigo-400">{i + 1}</span>
              <div className="flex-1">
                <p className="font-semibold">{f.apodo}</p>
                {f.colegio ? (
                  <p className="text-xs text-slate-500">{f.colegio}</p>
                ) : null}
              </div>
              <span className="font-bold text-green-400">
                {f.promedio ?? f.puntaje} pts
              </span>
            </li>
          ))}
        </ol>
      )}
    </MobileShell>
  );
}
