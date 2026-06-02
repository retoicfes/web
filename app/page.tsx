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
    <main className="flex flex-1 flex-col justify-between px-6 py-10">
      <div className="space-y-4">
        <HomeHero />
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Saber 11 · Colombia
          </p>
          <h1 className="text-4xl font-black leading-tight">
            Reto <span className="text-indigo-400">ICFES</span>
          </h1>
          <p className="text-slate-400">
            Como el Mundial, pero de conocimiento: retos rápidos, ranking por colegio y
            reta a tu curso por WhatsApp 📱
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/onboarding"
          className="block w-full rounded-2xl bg-indigo-500 py-4 text-center text-lg font-bold text-white shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
        >
          Empezar sin registro
        </Link>
        <Link
          href="/ranking"
          className="block w-full rounded-2xl border border-slate-700 py-3 text-center text-sm font-medium text-slate-300"
        >
          Ver rankings 🏆
        </Link>
        <ShareRetoButtons className="pt-2" />
      </div>
    </main>
  );
}
