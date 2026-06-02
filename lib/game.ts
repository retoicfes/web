export const PREGUNTAS_POR_RONDA = 10;
export const PUNTOS_POR_ACIERTO = 10;
/** Tiempo máximo por pregunta antes de contar como fallo. */
export const SEGUNDOS_POR_PREGUNTA = 30;

export type OpcionLetra = "A" | "B" | "C" | "D";

export type PreguntaDTO = {
  id: string;
  materia: string;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
};

export const FRASES_FALLA = [
  "Tranqui, hasta los profe se equivocan a veces 😅",
  "Esa la pilla en el simulacro — sigue 💪",
  "No era esa, pero ya aprendiste algo nuevo 🧠",
  "Casi — el ICFES también juega con la trampa mental 🎯",
];

export function fraseAlFallar(): string {
  return FRASES_FALLA[Math.floor(Math.random() * FRASES_FALLA.length)];
}

export function opcionTexto(p: PreguntaDTO, letra: OpcionLetra): string {
  const map = { A: p.opcionA, B: p.opcionB, C: p.opcionC, D: p.opcionD };
  return map[letra];
}
