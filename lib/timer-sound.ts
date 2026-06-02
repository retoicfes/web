/** Pitido corto con Web Audio (sin archivos). Requiere gesto previo del usuario (jugar). */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

export function playAlertaTimer(segundosRestantes: 5 | 3): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = segundosRestantes === 3 ? 880 : 660;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const t = ctx.currentTime;
  const dur = segundosRestantes === 3 ? 0.14 : 0.1;
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur);
}
