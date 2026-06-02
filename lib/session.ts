export const SESSION_KEY = "retoicfes_player";

export type PlayerSession = {
  apodo: string;
  departamento: string;
  municipio: string;
  colegio: string;
};

export function getPlayerSession(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerSession;
  } catch {
    return null;
  }
}

export function savePlayerSession(session: PlayerSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearPlayerSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
