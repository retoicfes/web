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

const LETRAS: OpcionLetra[] = ["A", "B", "C", "D"];

/** Mezcla Fisher–Yates (copia el array). */
export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Reordena las opciones A–D y actualiza la letra correcta. */
export function mezclarOpcionesPregunta<T extends PreguntaDTO & { correcta: string }>(p: T): T {
  const pares = LETRAS.map((letra) => ({
    letraOriginal: letra,
    texto: opcionTexto(p, letra),
  }));
  const mezcladas = shuffleArray(pares);
  const correctaOriginal = p.correcta.toUpperCase() as OpcionLetra;
  const idxCorrecta = mezcladas.findIndex((x) => x.letraOriginal === correctaOriginal);

  return {
    ...p,
    opcionA: mezcladas[0].texto,
    opcionB: mezcladas[1].texto,
    opcionC: mezcladas[2].texto,
    opcionD: mezcladas[3].texto,
    correcta: LETRAS[idxCorrecta] ?? correctaOriginal,
  };
}
