import "./load-env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const preguntas = [
  {
    materia: "Matemáticas",
    enunciado: "Si x + 5 = 12, ¿cuál es el valor de x?",
    opcionA: "5",
    opcionB: "7",
    opcionC: "12",
    opcionD: "17",
    correcta: "B",
    explicacion: "Restas 5 a ambos lados: x = 12 − 5 = 7.",
  },
  {
    materia: "Matemáticas",
    enunciado: "¿Cuál es el 20% de 150?",
    opcionA: "20",
    opcionB: "25",
    opcionC: "30",
    opcionD: "35",
    correcta: "C",
    explicacion: "0,20 × 150 = 30.",
  },
  {
    materia: "Lectura Crítica",
    enunciado:
      "En un texto, la palabra «sin embargo» suele introducir una idea de…",
    opcionA: "Ejemplo",
    opcionB: "Contraste",
    opcionC: "Definición",
    opcionD: "Repetición",
    correcta: "B",
    explicacion: "Marca oposición o matiz respecto a lo anterior.",
  },
  {
    materia: "Lectura Crítica",
    enunciado: "La tesis de un ensayo es principalmente…",
    opcionA: "Un dato estadístico",
    opcionB: "La idea central que se defiende",
    opcionC: "Una cita textual",
    opcionD: "El título del libro",
    correcta: "B",
    explicacion: "Es la postura o argumento central del autor.",
  },
  {
    materia: "Sociales",
    enunciado: "La Constitución Política de Colombia de 1991 estableció principalmente…",
    opcionA: "Una monarquía",
    opcionB: "Un estado social de derecho",
    opcionC: "El voto censitario",
    opcionD: "La abolición del Congreso",
    correcta: "B",
    explicacion: "Consagra derechos fundamentales y Estado social de derecho.",
  },
  {
    materia: "Sociales",
    enunciado: "¿Cuál organismo regula las elecciones en Colombia?",
    opcionA: "ICBF",
    opcionB: "Registraduría / CNE",
    opcionC: "DIAN",
    opcionD: "SENA",
    correcta: "B",
    explicacion: "Registraduría y CNE tienen roles en el proceso electoral.",
  },
  {
    materia: "Ciencias Naturales",
    enunciado: "La fotosíntesis ocurre principalmente en…",
    opcionA: "Raíces",
    opcionB: "Cloroplastos de las hojas",
    opcionC: "El estómago",
    opcionD: "Los huesos",
    correcta: "B",
    explicacion: "Los cloroplastos captan luz y convierten CO₂ en glucosa.",
  },
  {
    materia: "Ciencias Naturales",
    enunciado: "La unidad básica de la vida es…",
    opcionA: "El tejido",
    opcionB: "El órgano",
    opcionC: "La célula",
    opcionD: "La molécula de ADN sola",
    correcta: "C",
    explicacion: "Todos los seres vivos están formados por células.",
  },
  {
    materia: "Inglés",
    enunciado: 'Choose the correct form: "She ___ to school every day."',
    opcionA: "go",
    opcionB: "goes",
    opcionC: "going",
    opcionD: "gone",
    correcta: "B",
    explicacion: "Tercera persona singular en presente simple: goes.",
  },
  {
    materia: "Inglés",
    enunciado: '"Book" is a…',
    opcionA: "Verb",
    opcionB: "Adjective",
    opcionC: "Noun",
    opcionD: "Adverb",
    correcta: "C",
    explicacion: "Book es sustantivo (nombre de cosa).",
  },
  {
    materia: "Matemáticas",
    enunciado: "El área de un rectángulo de base 4 y altura 6 es…",
    opcionA: "10",
    opcionB: "20",
    opcionC: "24",
    opcionD: "46",
    correcta: "C",
    explicacion: "Área = base × altura = 4 × 6 = 24.",
  },
  {
    materia: "Lectura Crítica",
    enunciado: "Inferir en lectura significa…",
    opcionA: "Copiar una frase",
    opcionB: "Sacar conclusiones a partir del texto",
    opcionC: "Ignorar el contexto",
    opcionD: "Cambiar el autor",
    correcta: "B",
    explicacion: "Es deducir información no dicha explícitamente.",
  },
];

async function main() {
  await prisma.preguntaICFES.deleteMany();
  await prisma.ranking.deleteMany();
  await prisma.preguntaICFES.createMany({ data: preguntas });
  console.log(`Seed: ${preguntas.length} preguntas cargadas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
