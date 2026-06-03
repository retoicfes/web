import type { ResultadoICFES } from "@/lib/icfes-puntaje";
import { MAX_INTENTOS_RONDA } from "@/lib/game";

const COMPLETE_KEY = "retoicfes_round_complete";
const PUNTAJE_KEY = "retoicfes_last_puntaje";
const RESULTADO_KEY = "retoicfes_resultado_icfes";
const ULTIMA_RONDA_IDS_KEY = "retoicfes_ultima_ronda_ids";
const INTENTOS_KEY = "retoicfes_intentos_ronda";

export function getIntentosCompletados(): number {
  if (typeof window === "undefined") return 0;
  const n = Number(localStorage.getItem(INTENTOS_KEY) ?? 0);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function puedeJugarOtraRonda(): boolean {
  return getIntentosCompletados() < MAX_INTENTOS_RONDA;
}

export function intentosRestantes(): number {
  return Math.max(0, MAX_INTENTOS_RONDA - getIntentosCompletados());
}

/** Etiqueta para UI: "Intento 1 de 2" */
export function etiquetaIntentoActual(): string {
  const siguiente = Math.min(getIntentosCompletados() + 1, MAX_INTENTOS_RONDA);
  return `Intento ${siguiente} de ${MAX_INTENTOS_RONDA}`;
}

function registrarIntentoCompletado(): void {
  if (typeof window === "undefined") return;
  const actual = getIntentosCompletados();
  if (actual < MAX_INTENTOS_RONDA) {
    localStorage.setItem(INTENTOS_KEY, String(actual + 1));
  }
}

export function reiniciarContadorIntentos(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(INTENTOS_KEY);
}

export function markRoundComplete(resultado: ResultadoICFES): void {
  if (typeof window === "undefined") return;
  registrarIntentoCompletado();
  localStorage.setItem(COMPLETE_KEY, "1");
  localStorage.setItem(PUNTAJE_KEY, String(resultado.puntajeGlobal));
  localStorage.setItem(RESULTADO_KEY, JSON.stringify(resultado));
}

export function clearRoundComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMPLETE_KEY);
  localStorage.removeItem(PUNTAJE_KEY);
  localStorage.removeItem(RESULTADO_KEY);
  // No borra INTENTOS_KEY: el límite aplica por ciclo hasta reset admin o reiniciarContadorIntentos
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
