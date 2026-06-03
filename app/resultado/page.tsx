"use client";

import { IcfesReporte } from "@/components/resultado/IcfesReporte";
import { ShareRetoButtons } from "@/components/share/ShareRetoButtons";
import { MobileShell } from "@/components/ui/MobileShell";
import { MAX_INTENTOS_RONDA } from "@/lib/game";
import {
  getResultadoICFES,
  intentosRestantes,
  puedeJugarOtraRonda,
} from "@/lib/round";
import { getPlayerSession } from "@/lib/session";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

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

function ResultadoContent() {
  const params = useSearchParams();
  const puntajeUrl = Number(params.get("puntaje") ?? 0);
  const saveError = params.get("saveError");
  const saved = params.get("saved") === "1";
  const sinMejora = params.get("sinMejora") === "1";
  const sinIntentos = params.get("sinIntentos") === "1";
  const session = getPlayerSession();
  const resultado = useMemo(() => getResultadoICFES(), []);
  const puntajeGlobal = resultado?.puntajeGlobal ?? puntajeUrl;
  const puedeReintentar = puedeJugarOtraRonda();

  return (
    <MobileShell title="¡Ronda terminada!" subtitle={session?.colegio} backHref="/">
      {sinIntentos || !puedeReintentar ? (
        <p className="mb-4 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-sm text-slate-300">
          Usaste tus {MAX_INTENTOS_RONDA} intentos de esta temporada. Revisa el ranking o espera
          a que el profe reinicie la competencia.
        </p>
      ) : intentosRestantes() > 0 ? (
        <p className="mb-4 text-center text-sm text-indigo-300/90">
          Te queda {intentosRestantes()} intento{intentosRestantes() === 1 ? "" : "s"} más para
          mejorar tu puntaje.
        </p>
      ) : null}
      {saveError ? (
        <p className="mb-4 rounded-xl border border-amber-500/50 bg-amber-950/50 px-4 py-3 text-sm text-amber-200">
          No se guardó en el ranking:{" "}
          {saveError === "red"
            ? "sin conexión al servidor"
            : decodeURIComponent(saveError)}
          . Revisa /api/health en producción y variables DATABASE_URL en Vercel.
        </p>
      ) : saved ? (
        <p className="mb-4 text-center text-sm text-green-400">
          {sinMejora
            ? "Tu récord en el ranking se mantiene (este intento no lo superó) ✓"
            : "Mejor puntaje guardado en el ranking ✓"}
        </p>
      ) : null}

      {resultado ? (
        <IcfesReporte resultado={resultado} />
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-5xl font-black tabular-nums text-indigo-400">{puntajeGlobal}</p>
          <p className="text-slate-400">puntaje global /500</p>
        </div>
      )}

      {session ? (
        <p className="text-center text-sm text-slate-500">
          {session.apodo} · {session.municipio}, {session.departamento}
        </p>
      ) : null}

      <ShareRetoButtons
        destacado
        puntaje={puntajeGlobal}
        apodo={session?.apodo}
        colegio={session?.colegio}
        className="border-t border-slate-800 pt-4"
      />

      <div className="flex flex-col gap-3 pt-2">
        {puedeReintentar ? (
          <Link
            href="/jugar?nueva=1"
            className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/50 bg-indigo-500/10 px-10 py-4 text-lg font-bold text-indigo-300 active:scale-[0.98]"
          >
            Intentar de nuevo ({intentosRestantes()} restante
            {intentosRestantes() === 1 ? "" : "s"})
          </Link>
        ) : null}
        <Link
          href={session ? "/ranking?scope=colegio" : "/ranking"}
          className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
        >
          <IconTrophy className="h-6 w-6" />
          Ranking
        </Link>
      </div>
    </MobileShell>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-slate-400">Cargando…</p>}>
      <ResultadoContent />
    </Suspense>
  );
}
