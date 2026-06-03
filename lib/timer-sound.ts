/** Pitidos con Web Audio (sin archivos). El navegador exige gesto previo del usuario. */
let audioCtx: AudioContext | null = null;
let desbloqueado = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

/** Llamar tras toque/clic del usuario para poder reproducir durante el timer. */
export async function unlockTimerAudio(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  desbloqueado = ctx.state === "running";
  return desbloqueado;
}

export function isTimerAudioUnlocked(): boolean {
  return desbloqueado && audioCtx?.state === "running";
}

import { SEGUNDOS_CUENTA_REGRESIVA, SEGUNDOS_TIMER_CRITICO } from "@/lib/game";

/** Un pitido por segundo de la cuenta regresiva (15…1). */
export async function playTickCuentaRegresiva(segundosRestantes: number): Promise<void> {
  if (segundosRestantes < 1 || segundosRestantes > SEGUNDOS_CUENTA_REGRESIVA) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }
  if (ctx.state !== "running") return;
  desbloqueado = true;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  // Más agudo al acercarse a 0
  osc.frequency.value =
    440 + ((SEGUNDOS_CUENTA_REGRESIVA - segundosRestantes) / SEGUNDOS_CUENTA_REGRESIVA) * 280;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const t = ctx.currentTime;
  const dur = segundosRestantes <= SEGUNDOS_TIMER_CRITICO ? 0.18 : 0.12;
  const vol = segundosRestantes <= SEGUNDOS_TIMER_CRITICO ? 0.28 : 0.2;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur);

  if (segundosRestantes <= SEGUNDOS_TIMER_CRITICO) {
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 880;
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    const t2 = t + 0.14;
    gain2.gain.setValueAtTime(0.22, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.1);
    osc2.start(t2);
    osc2.stop(t2 + 0.1);
  }
}
