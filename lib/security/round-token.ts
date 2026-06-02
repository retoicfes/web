import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const SECRET =
  process.env.ROUND_SIGNING_SECRET ??
  (process.env.NODE_ENV === "production" ? "" : "retoicfes-dev-secret");

function requireSecret(): string {
  if (!SECRET) {
    throw new Error("ROUND_SIGNING_SECRET no configurado");
  }
  return SECRET;
}

function firmar(body: string): string {
  return createHmac("sha256", requireSecret()).update(body).digest("base64url");
}

function verificarFirma(body: string, sig: string): boolean {
  try {
    const expected = firmar(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type RoundTokenPayload = {
  ids: string[];
  shuffleSeed: string;
  exp: number;
  n: string;
  startedAt: number;
};

export type RankingTokenPayload = {
  puntajeGlobal: number;
  roundNonce: string;
  exp: number;
};

export function crearTokenRonda(preguntaIds: string[], shuffleSeed: string): string {
  const payload: RoundTokenPayload = {
    ids: preguntaIds,
    shuffleSeed,
    exp: Date.now() + 20 * 60 * 1000,
    n: randomBytes(12).toString("hex"),
    startedAt: Date.now(),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${firmar(body)}`;
}

export function verificarTokenRonda(token: string): RoundTokenPayload | null {
  if (!SECRET) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || !verificarFirma(body, sig)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as RoundTokenPayload;
    if (payload.exp < Date.now()) return null;
    if (!Array.isArray(payload.ids) || payload.ids.length === 0) return null;
    if (!payload.shuffleSeed || typeof payload.shuffleSeed !== "string") return null;
    if (payload.ids.length > 20) return null;
    return payload;
  } catch {
    return null;
  }
}

export function crearTokenRanking(puntajeGlobal: number, roundNonce: string): string {
  const payload: RankingTokenPayload = {
    puntajeGlobal,
    roundNonce,
    exp: Date.now() + 10 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${firmar(body)}`;
}

export function verificarTokenRanking(token: string, puntajeEsperado: number): boolean {
  if (!SECRET) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig || !verificarFirma(body, sig)) return false;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as RankingTokenPayload;
    if (payload.exp < Date.now()) return false;
    if (payload.puntajeGlobal !== puntajeEsperado) return false;
    return Boolean(payload.roundNonce);
  } catch {
    return false;
  }
}

export function signingConfigured(): boolean {
  return Boolean(SECRET);
}
