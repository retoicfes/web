"use client";

import { MobileShell } from "@/components/ui/MobileShell";
import { getPlayerSession } from "@/lib/session";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
      <div className="space-y-3">
        <Link
          href="/jugar?nueva=1"
          className="block rounded-2xl bg-indigo-500 py-4 text-center font-bold text-white"
        >
          Jugar otra vez
        </Link>
        <Link
          href="/ranking"
          className="block rounded-2xl border border-slate-700 py-3 text-center text-slate-300"
        >
          Ver ranking 🏆
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
