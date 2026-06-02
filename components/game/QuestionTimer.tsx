"use client";

import { SEGUNDOS_POR_PREGUNTA } from "@/lib/game";

type Props = {
  segundosRestantes: number;
  segundosTotal?: number;
  pausado?: boolean;
};

export function QuestionTimer({
  segundosRestantes,
  segundosTotal = SEGUNDOS_POR_PREGUNTA,
  pausado = false,
}: Props) {
  const ratio = Math.max(0, Math.min(1, segundosRestantes / segundosTotal));
  const urgente = segundosRestantes <= 5 && !pausado;
  const critico = segundosRestantes <= 3 && !pausado;

  const barColor = critico
    ? "bg-red-500"
    : urgente
      ? "bg-amber-400"
      : "bg-indigo-400";

  const textColor = critico
    ? "text-red-400"
    : urgente
      ? "text-amber-300"
      : "text-slate-300";

  return (
    <div className="space-y-1.5" aria-live="polite" aria-atomic="true">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Tiempo</span>
        <span
          className={`tabular-nums font-bold ${textColor} ${urgente && !pausado ? "animate-pulse" : ""}`}
        >
          {pausado ? "—" : `${segundosRestantes}s`}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-valuenow={segundosRestantes}
        aria-valuemin={0}
        aria-valuemax={segundosTotal}
        aria-label={`Tiempo restante: ${segundosRestantes} segundos`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
