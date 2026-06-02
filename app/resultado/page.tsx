"use client";

import { ShareRetoButtons } from "@/components/share/ShareRetoButtons";
import { MobileShell } from "@/components/ui/MobileShell";
import { getPlayerSession } from "@/lib/session";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
  const puntaje = Number(params.get("puntaje") ?? 0);
  const saveError = params.get("saveError");
  const saved = params.get("saved") === "1";
  const session = getPlayerSession();

  return (
    <MobileShell title="¡Ronda terminada!" subtitle={session?.colegio}>
      {saveError ? (
        <p className="mb-4 rounded-xl border border-amber-500/50 bg-amber-950/50 px-4 py-3 text-sm text-amber-200">
          No se guardó en el ranking:{" "}
          {saveError === "red"
            ? "sin conexión al servidor"
            : decodeURIComponent(saveError)}
          . Revisa /api/health en producción y variables DATABASE_URL en Vercel.
        </p>
      ) : saved ? (
        <p className="mb-4 text-center text-sm text-green-400">Puntaje guardado en el ranking ✓</p>
      ) : null}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="text-6xl font-black text-indigo-400">{puntaje}</p>
        <p className="text-slate-400">puntos en esta ronda</p>
        {session ? (
          <p className="text-sm text-slate-500">
            {session.apodo} · {session.municipio}, {session.departamento}
          </p>
        ) : null}
      </div>
      <ShareRetoButtons
        destacado
        puntaje={puntaje}
        apodo={session?.apodo}
        colegio={session?.colegio}
        className="border-t border-slate-800 pt-4"
      />

      <div className="flex justify-center pt-2">
        <Link
          href="/ranking"
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
