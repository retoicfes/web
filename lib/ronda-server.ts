import type { OpcionLetra, PreguntaDTO } from "@/lib/game";
import { mezclarOpcionesConSemilla } from "@/lib/game";

type PreguntaConCorrecta = PreguntaDTO & { correcta: string; explicacion: string };

export function publicarPreguntaRonda(
  p: PreguntaConCorrecta,
  shuffleSeed: string,
): PreguntaDTO {
  return mezclarOpcionesConSemilla(p, shuffleSeed).pregunta;
}

export function letraCorrectaRonda(
  p: PreguntaConCorrecta,
  shuffleSeed: string,
): OpcionLetra {
  return mezclarOpcionesConSemilla(p, shuffleSeed).correcta;
}

export function evaluarRespuestaRonda(
  p: PreguntaConCorrecta,
  shuffleSeed: string,
  letra: string | null,
): boolean {
  if (letra == null) return false;
  const correcta = letraCorrectaRonda(p, shuffleSeed);
  return correcta === letra.toUpperCase();
}
