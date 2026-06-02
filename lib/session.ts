export const SESSION_KEY = "retoicfes_player";

export type PlayerSession = {
  apodo: string;
  departamento: string;
  municipio: string;
  colegio: string;
  daneDepartamento: string;
  daneMunicipio: string;
  codigoEstablecimiento: string;
};

export function getPlayerSession(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlayerSession>;
    if (
      !parsed.apodo ||
      !parsed.departamento ||
      !parsed.municipio ||
      !parsed.colegio ||
      !parsed.daneDepartamento ||
      !parsed.daneMunicipio ||
      !parsed.codigoEstablecimiento
    ) {
      return null;
    }
    return parsed as PlayerSession;
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
