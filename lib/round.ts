import type { ResultadoICFES } from "@/lib/icfes-puntaje";

const COMPLETE_KEY = "retoicfes_round_complete";
const PUNTAJE_KEY = "retoicfes_last_puntaje";
const RESULTADO_KEY = "retoicfes_resultado_icfes";
const ULTIMA_RONDA_IDS_KEY = "retoicfes_ultima_ronda_ids";

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

/** IDs de la última ronda jugada — para evitar repetir el mismo set al instante. */
export function saveUltimaRondaIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ULTIMA_RONDA_IDS_KEY, JSON.stringify(ids));
}

export function getUltimaRondaIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ULTIMA_RONDA_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
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
