"use client";

import { MobileShell } from "@/components/ui/MobileShell";
import { getPlayerSession } from "@/lib/session";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResultadoContent() {
  const params = useSearchParams();
  const puntaje = Number(params.get("puntaje") ?? 0);
  const session = getPlayerSession();

  return (
    <MobileShell title="¡Ronda terminada!" subtitle={session?.colegio}>
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
          href="/jugar"
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
