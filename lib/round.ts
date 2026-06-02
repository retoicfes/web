const COMPLETE_KEY = "retoicfes_round_complete";
const PUNTAJE_KEY = "retoicfes_last_puntaje";

/** Marca que la ronda actual ya terminó (evita volver a /jugar al recargar). */
export function markRoundComplete(puntaje: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETE_KEY, "1");
  localStorage.setItem(PUNTAJE_KEY, String(puntaje));
}

export function clearRoundComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMPLETE_KEY);
  localStorage.removeItem(PUNTAJE_KEY);
}

export function getCompletedRound(): { puntaje: number } | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(COMPLETE_KEY) !== "1") return null;
  return { puntaje: Number(localStorage.getItem(PUNTAJE_KEY) ?? 0) };
}
