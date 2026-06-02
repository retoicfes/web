"use client";

import {
  AREAS_ICFES,
  ETIQUETA_CORTA_AREA,
  SUMA_PONDERACIONES,
  type AreaICFES,
  type ResultadoICFES,
} from "@/lib/icfes-puntaje";
import { useMemo, useState } from "react";

const ICONO_AREA: Record<AreaICFES, string> = {
  "Lectura Crítica": "📖",
  Matemáticas: "🔢",
  "Sociales y Ciudadanas": "🌎",
  "Ciencias Naturales": "🧪",
  Inglés: "💬",
};

type Props = {
  resultado: ResultadoICFES;
};

function IconTrophy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21 2.18.58 3 2.04 3 3.79" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export function IcfesReporte({ resultado }: Props) {
  const [mostrarCalculo, setMostrarCalculo] = useState(false);
  const { puntajeGlobal, porArea } = resultado;

  const sumaPonderada = useMemo(
    () => AREAS_ICFES.reduce((s, a) => s + porArea[a].ponderado, 0),
    [porArea],
  );
  const promedioPonderado = sumaPonderada / SUMA_PONDERACIONES;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <IconTrophy className="h-4 w-4 text-amber-400" />
              Puntaje global
            </p>
            <p className="mt-1 text-4xl font-black tabular-nums text-emerald-400">
              {puntajeGlobal}
              <span className="text-lg font-semibold text-slate-500">/500</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarCalculo((v) => !v)}
            className="shrink-0 rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-xs font-semibold text-amber-200"
          >
            ¿Cómo se calcula?
          </button>
        </div>

        {mostrarCalculo ? (
          <div className="mt-4 space-y-4 border-t border-slate-800 pt-4 text-sm">
            <div>
              <p className="mb-2 font-semibold text-indigo-300">Paso 1 · Por prueba (0–100)</p>
              <p className="mb-2 text-xs text-slate-500">
                Aciertos ÷ preguntas de la ronda × 100, luego × ponderación (×3 o ×1 en
                Inglés).
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full min-w-[280px] text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400">
                    <tr>
                      <th className="px-2 py-2">Prueba</th>
                      <th className="px-2 py-2">Puntaje</th>
                      <th className="px-2 py-2">Pond.</th>
                      <th className="px-2 py-2">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {AREAS_ICFES.map((area) => (
                      <tr key={area}>
                        <td className="px-2 py-2 text-slate-300">{ETIQUETA_CORTA_AREA[area]}</td>
                        <td className="px-2 py-2 tabular-nums">{porArea[area].puntaje}</td>
                        <td className="px-2 py-2 tabular-nums">{porArea[area].ponderacion}</td>
                        <td className="px-2 py-2 font-medium tabular-nums text-amber-200/90">
                          {porArea[area].ponderado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p className="mb-2 font-semibold text-indigo-300">Paso 2 · Puntaje global</p>
              <p className="text-xs leading-relaxed text-slate-400">
                Suma los resultados ({sumaPonderada}), divide entre {SUMA_PONDERACIONES} (
                {promedioPonderado.toFixed(2)}), multiplica por 5 y redondea →{" "}
                <strong className="text-emerald-400">{puntajeGlobal}</strong>.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Puntaje por pruebas
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {AREAS_ICFES.map((area) => {
            const d = porArea[area];
            return (
              <div
                key={area}
                className="flex min-w-[5.5rem] shrink-0 flex-col items-center rounded-xl border border-slate-700 bg-slate-800/60 px-2 py-3"
              >
                <span className="text-xl" aria-hidden>
                  {ICONO_AREA[area]}
                </span>
                <span className="mt-1 text-center text-[10px] leading-tight text-slate-400">
                  {ETIQUETA_CORTA_AREA[area]}
                </span>
                <span className="mt-1 text-lg font-bold tabular-nums text-white">
                  {d.puntaje}
                  <span className="text-xs font-normal text-slate-500">/100</span>
                </span>
                {d.total > 0 ? (
                  <span className="mt-0.5 text-[10px] text-slate-600">
                    {d.correctas}/{d.total} aciertos
                  </span>
                ) : (
                  <span className="mt-0.5 text-[10px] text-slate-600">sin preguntas</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {AREAS_ICFES.map((area) => {
          const d = porArea[area];
          return (
            <div key={area} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs text-slate-400">{ETIQUETA_CORTA_AREA[area]}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${d.puntaje}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-slate-300">
                {d.puntaje}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-slate-600">
        Simulación formativa · no es resultado oficial del ICFES
      </p>
    </div>
  );
}
