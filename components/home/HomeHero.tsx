"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export const AREAS_SABER_11 = [
  "Lectura Crítica",
  "Matemáticas",
  "Ciencias Naturales",
  "Inglés",
  "Sociales y Ciudadanas",
] as const;

/** Rutas en public/images/ (se prueba WebP y luego PNG). */
export const HOME_HERO_IMAGE_CANDIDATES = [
  "/images/home-hero-mundial.webp",
  "/images/home-hero-mundial.png",
] as const;

function HomeHeroIllustration() {
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 shadow-xl shadow-indigo-900/40"
      aria-hidden
    >
      <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-6 top-1/4 h-28 w-28 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-red-500/15 blur-3xl" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(99,102,241,0.35),transparent_55%)]" />

      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-200">
        <span className="animate-pulse" aria-hidden>
          ⚽
        </span>
        Temporada Mundial 2026
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-6">
        <div className="relative mb-3">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" style={{ animationDuration: "2.5s" }} />
          <svg
            className="relative h-28 w-28 drop-shadow-lg"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="60" r="52" fill="url(#ballGrad)" />
            <path
              d="M60 20 L72 38 L92 42 L78 56 L81 76 L60 66 L39 76 L42 56 L28 42 L48 38 Z"
              fill="rgba(15,23,42,0.35)"
            />
            <path
              d="M60 44 L68 54 L82 52 L74 62 L76 76 L60 70 L44 76 L46 62 L38 52 L52 54 Z"
              fill="rgba(255,255,255,0.12)"
            />
            <defs>
              <radialGradient id="ballGrad" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#4338ca" />
              </radialGradient>
            </defs>
          </svg>
          <span className="absolute -right-2 -top-1 text-3xl drop-shadow-md" aria-hidden>
            🎓
          </span>
          <span className="absolute -bottom-1 -left-3 text-2xl drop-shadow-md" aria-hidden>
            📋
          </span>
        </div>

        <p className="text-center text-lg font-black leading-tight text-white">
          Tu mundial es{" "}
          <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            Saber 11
          </span>
        </p>
        <p className="mt-1 text-center text-sm font-bold text-indigo-100">
          Ranking de tu institución
        </p>
      </div>

      <div className="absolute bottom-3 left-0 right-0 flex flex-wrap justify-center gap-1.5 px-3">
        {AREAS_SABER_11.map((m) => (
          <span
            key={m}
            className="rounded-lg bg-slate-900/75 px-1.5 py-0.5 text-[9px] font-medium leading-tight text-slate-300 backdrop-blur-sm"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HomeHero() {
  const [heroSrc, setHeroSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const tryNext = (index: number) => {
      if (cancelled || index >= HOME_HERO_IMAGE_CANDIDATES.length) {
        if (!cancelled) setHeroSrc(null);
        return;
      }
      const src = HOME_HERO_IMAGE_CANDIDATES[index];
      const probe = new window.Image();
      probe.onload = () => {
        if (!cancelled) setHeroSrc(src);
      };
      probe.onerror = () => tryNext(index + 1);
      probe.src = src;
    };

    tryNext(0);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-3">
      {heroSrc ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-indigo-500/30 shadow-xl shadow-indigo-900/40">
          <Image
            src={heroSrc}
            alt="Estudiante de grado 11 preparándose para Saber 11 con energía de Mundial"
            fill
            priority
            sizes="(max-width: 448px) 100vw, 400px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent px-4 pb-4 pt-16">
            <p className="text-center text-lg font-black text-white">
              Tu mundial es <span className="text-amber-300">Saber 11</span>
            </p>
            <p className="mt-0.5 text-center text-sm font-bold text-indigo-100">
              Ranking de tu institución
            </p>
          </div>
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100 backdrop-blur-sm">
            ⚽ Temporada Mundial 2026
          </div>
        </div>
      ) : (
        <HomeHeroIllustration />
      )}
    </div>
  );
}
