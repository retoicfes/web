"use client";

import { HomeHero } from "@/components/home/HomeHero";
import { ShareRetoButtons } from "@/components/share/ShareRetoButtons";
import { getCompletedRound } from "@/lib/round";
import { getPlayerSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getPlayerSession();
    if (session) {
      router.replace(getCompletedRound() ? "/ranking" : "/jugar");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-slate-400">Cargando…</p>
      </div>
    );
  }

  return (
    <main className="relative flex flex-1 flex-col justify-between overflow-hidden px-6 py-10">
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
        </div>
      </div>

      <div className="relative space-y-3">
        <Link
          href="/onboarding"
          className="block w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-600 py-4 text-center text-lg font-bold text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
        >
          Empezar sin registro
        </Link>
        <Link
          href="/ranking"
          className="block w-full rounded-2xl border border-teal-500/35 bg-teal-950/25 py-3 text-center text-sm font-medium text-teal-100/90 backdrop-blur-sm active:scale-[0.98]"
        >
          Ver rankings 🏆
        </Link>
        <ShareRetoButtons className="pt-2" ocultarEncabezado />
      </div>
    </main>
  );
}
