"use client";

import { HomeHero } from "@/components/home/HomeHero";
import { ShareRetoButtons } from "@/components/share/ShareRetoButtons";
import { MAX_INTENTOS_RONDA } from "@/lib/game";
import {
  getCompletedRound,
  intentosRestantes,
  puedeJugarOtraRonda,
} from "@/lib/round";
import { getPlayerSession } from "@/lib/session";
import Link from "next/link";
import { useEffect, useState } from "react";

type EstadoHome = {
  session: ReturnType<typeof getPlayerSession>;
  rondaCompleta: ReturnType<typeof getCompletedRound>;
  puedeJugar: boolean;
  restantes: number;
};

export function HomePageClient() {
  const [ready, setReady] = useState(false);
  const [estado, setEstado] = useState<EstadoHome | null>(null);

  useEffect(() => {
    setEstado({
      session: getPlayerSession(),
      rondaCompleta: getCompletedRound(),
      puedeJugar: puedeJugarOtraRonda(),
      restantes: intentosRestantes(),
    });
    setReady(true);
  }, []);

  if (!ready || !estado) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-slate-400">Cargando…</p>
      </div>
    );
  }

  const { session, rondaCompleta, puedeJugar, restantes } = estado;
  const sinRondaTerminada = session && !rondaCompleta;

  let ctaHref = "/onboarding";
  let ctaLabel = "Empezar sin registro";
  let ctaDeshabilitado = false;

  if (session) {
    if (sinRondaTerminada) {
      ctaHref = "/jugar";
      ctaLabel = "Jugar";
    } else if (puedeJugar) {
      ctaHref = "/jugar?nueva=1";
      ctaLabel =
        restantes === MAX_INTENTOS_RONDA
          ? "Jugar"
          : `Nuevo intento (${restantes} restante${restantes === 1 ? "" : "s"})`;
    } else {
      ctaDeshabilitado = true;
      ctaLabel = `Intentos usados (${MAX_INTENTOS_RONDA}/${MAX_INTENTOS_RONDA})`;
    }
  }

  return (
    <div className="relative flex flex-1 flex-col justify-between overflow-hidden px-6 py-10">
      <div
        className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-12 top-1/3 h-40 w-40 rounded-full bg-violet-500/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-24 left-1/4 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-4">
        <HomeHero />
        <div className="space-y-2 text-center">
          <p className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 bg-clip-text text-sm font-semibold uppercase tracking-widest text-transparent">
            Saber 11 · Colombia
          </p>
          <h1 className="text-4xl font-black leading-tight">
            Reto{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-teal-300 bg-clip-text text-transparent">
              ICFES
            </span>
          </h1>
          <p className="text-slate-300">
            Reta a tu curso por WhatsApp y reta a otras instituciones 📱
          </p>
          <p className="text-xs font-medium text-teal-300/90">
            10 preguntas · 60 segundos por ítem
          </p>
          {session ? (
            <p className="text-xs text-slate-500">
              Hola, <span className="text-slate-300">{session.apodo}</span>
              {rondaCompleta && !puedeJugar
                ? " · ya usaste tus 2 intentos"
                : rondaCompleta && puedeJugar
                  ? ` · te queda${restantes === 1 ? "" : "n"} ${restantes} intento${restantes === 1 ? "" : "s"}`
                  : sinRondaTerminada
                    ? " · puedes iniciar tu ronda"
                    : null}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative space-y-3">
        {ctaDeshabilitado ? (
          <div
            className="block w-full cursor-not-allowed rounded-2xl border border-slate-700 bg-slate-800/80 py-4 text-center text-lg font-bold text-slate-500"
            aria-disabled
          >
            {ctaLabel}
          </div>
        ) : (
          <Link
            href={ctaHref}
            className="block w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-600 py-4 text-center text-lg font-bold text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            {ctaLabel}
          </Link>
        )}
        {rondaCompleta ? (
          <Link
            href="/resultado"
            className="block w-full rounded-2xl border border-violet-500/30 bg-violet-950/20 py-3 text-center text-sm font-medium text-violet-100/90 backdrop-blur-sm active:scale-[0.98]"
          >
            Ver mi último resultado
          </Link>
        ) : null}
        <Link
          href="/ranking"
          className="block w-full rounded-2xl border border-teal-500/35 bg-teal-950/25 py-3 text-center text-sm font-medium text-teal-100/90 backdrop-blur-sm active:scale-[0.98]"
        >
          Ver rankings 🏆
        </Link>
        <ShareRetoButtons className="pt-2" ocultarEncabezado />
      </div>
    </div>
  );
}
