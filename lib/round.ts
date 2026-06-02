import type { ResultadoICFES } from "@/lib/icfes-puntaje";

const COMPLETE_KEY = "retoicfes_round_complete";
const PUNTAJE_KEY = "retoicfes_last_puntaje";
const RESULTADO_KEY = "retoicfes_resultado_icfes";

export function markRoundComplete(resultado: ResultadoICFES): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETE_KEY, "1");
  localStorage.setItem(PUNTAJE_KEY, String(resultado.puntajeGlobal));
  localStorage.setItem(RESULTADO_KEY, JSON.stringify(resultado));
}

export function clearRoundComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMPLETE_KEY);
  localStorage.removeItem(PUNTAJE_KEY);
  localStorage.removeItem(RESULTADO_KEY);
}

export function getResultadoICFES(): ResultadoICFES | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RESULTADO_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResultadoICFES;
  } catch {
    return null;
  }
}

export function getCompletedRound(): { puntaje: number; resultado: ResultadoICFES | null } | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(COMPLETE_KEY) !== "1") return null;
  const puntaje = Number(localStorage.getItem(PUNTAJE_KEY) ?? 0);
  return { puntaje, resultado: getResultadoICFES() };
}
