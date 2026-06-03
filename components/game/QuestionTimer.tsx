"use client";

import {
  SEGUNDOS_CUENTA_REGRESIVA,
  SEGUNDOS_POR_PREGUNTA,
  SEGUNDOS_TIMER_CRITICO,
} from "@/lib/game";

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
  const enCuentaRegresiva =
    !pausado && segundosRestantes > 0 && segundosRestantes <= SEGUNDOS_CUENTA_REGRESIVA;
  const urgente = segundosRestantes <= SEGUNDOS_CUENTA_REGRESIVA && !pausado;
  const critico = segundosRestantes <= SEGUNDOS_TIMER_CRITICO && !pausado;

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

  const ringColor = critico
    ? "stroke-red-500"
    : urgente
      ? "stroke-amber-400"
      : "stroke-indigo-400";

  const numeroColor = critico
    ? "text-red-300"
    : urgente
      ? "text-amber-200"
      : "text-white";

  const circunferencia = 2 * Math.PI * 44;
  const progresoAnillo =
    enCuentaRegresiva && segundosRestantes > 0
      ? (segundosRestantes / SEGUNDOS_CUENTA_REGRESIVA) * circunferencia
      : 0;

  return (
    <div className="space-y-2" aria-live="polite" aria-atomic="true">
      {enCuentaRegresiva ? (
        <div className="flex flex-col items-center gap-2 py-1">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400/90">
            Tiempo
          </p>
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 96 96"
              aria-hidden
            >
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                className="stroke-slate-800"
                strokeWidth="6"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                className={`${ringColor} transition-all duration-500`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circunferencia}
                strokeDashoffset={circunferencia - progresoAnillo}
              />
            </svg>
            <span
              key={segundosRestantes}
              className={`relative z-10 select-none font-black tabular-nums leading-none ${numeroColor} animate-[timerPop_0.35s_ease-out] ${
                segundosRestantes >= 10 ? "text-4xl" : "text-5xl"
              }`}
              aria-label={`${segundosRestantes} segundos`}
            >
              {segundosRestantes}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Tiempo</span>
          <span className={`tabular-nums font-bold ${textColor}`}>
            {pausado ? "—" : `${segundosRestantes}s`}
          </span>
        </div>
      )}

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
