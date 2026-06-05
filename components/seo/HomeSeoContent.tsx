import Link from "next/link";

const FAQ = [
  {
    q: "¿Qué es Reto ICFES?",
    a: "Reto ICFES es un simulacro gratuito de Pruebas Saber 11 para estudiantes de grado 11° en Colombia. Practica preguntas tipo ICFES con cronómetro, explicación al instante y ranking por colegio.",
  },
  {
    q: "¿Es un simulacro ICFES gratis?",
    a: "Sí. Puedes hacer simulacros de Saber 11 sin pagar ni crear cuenta con correo. Solo eliges tu colegio, un apodo y empiezas a practicar las pruebas Saber desde el celular.",
  },
  {
    q: "¿Qué pruebas Saber 11 incluye el simulacro?",
    a: "Cada ronda tiene 15 preguntas: 3 por área en Matemáticas, Lectura Crítica, Sociales y Ciudadanas, Ciencias Naturales e Inglés, alineadas al formato de las Pruebas Saber grado 11.",
  },
  {
    q: "¿Sirve para prepararme para el examen ICFES?",
    a: "Sirve para repasar y medir avance antes del examen ICFES: ritmo de respuesta, manejo del tiempo y puntaje global estimado tipo Saber 11. Complementa clase y simulacros del colegio.",
  },
  {
    q: "¿Necesito registrarme con correo?",
    a: "No. Solo eliges tu colegio con datos DANE, un apodo y juegas. Puedes compartir tu puntaje y retar a tu curso por WhatsApp.",
  },
  {
    q: "¿Cómo funciona el ranking de simulacros?",
    a: "Al terminar la ronda tu mejor puntaje puede guardarse en el ranking de tu colegio, municipio, departamento y a nivel nacional para comparar resultados entre instituciones.",
  },
  {
    q: "¿Cuántos intentos de simulacro Saber 11 tengo?",
    a: "Por dispositivo puedes completar 2 rondas en cada temporada de competencia. Así puedes mejorar tu puntaje sin repetir el mismo set de preguntas al instante.",
  },
] as const;

/** Texto indexable en la home (SSR) para buscadores. */
export function HomeSeoContent() {
  return (
    <section
      className="border-t border-slate-800/80 px-6 py-8 text-sm leading-relaxed text-slate-400"
      aria-labelledby="seo-home-heading"
    >
      <h2 id="seo-home-heading" className="mb-3 text-base font-bold text-slate-200">
        Simulacro ICFES y Pruebas Saber 11 gratis en Colombia
      </h2>
      <p className="mb-3">
        <strong className="font-semibold text-slate-300">Reto ICFES</strong> es una plataforma
        para practicar <strong className="font-semibold text-slate-400">simulacros ICFES</strong>{" "}
        y <strong className="font-semibold text-slate-400">Pruebas Saber 11</strong> en formato
        móvil. Ideal si buscas preguntas tipo ICFES, repaso de grado 11° o un simulacro Saber 11
        rápido con puntaje global y ranking por colegio.
      </p>
      <p className="mb-3">
        Las <strong className="font-semibold text-slate-400">pruebas Saber</strong> del bachillerato
        evalúan cinco áreas; aquí entrenas las cinco en rondas cortas con retroalimentación
        inmediata. Perfecto para simulacros escolares, retos entre cursos y preparación antes del
        examen ICFES de grado 11°.
      </p>

      <h3 className="mb-2 text-sm font-semibold text-slate-300">
        ¿Por qué practicar Saber 11 con Reto ICFES?
      </h3>
      <ul className="mb-4 list-inside list-disc space-y-1 text-slate-500">
        <li>Simulacro ICFES y Saber 11 gratis, sin correo</li>
        <li>15 preguntas por ronda (3 por cada área del Saber 11)</li>
        <li>Preguntas con contexto cuando el ítem lo requiere</li>
        <li>Ranking por colegio, municipio, departamento y Colombia</li>
        <li>Retos por WhatsApp entre compañeros y colegios</li>
        <li>Funciona en el celular: practica ICFES en línea donde estés</li>
      </ul>

      <h3 className="mb-2 text-sm font-semibold text-slate-300">Preguntas frecuentes</h3>
      <dl className="space-y-3">
        {FAQ.map((item) => (
          <div key={item.q}>
            <dt className="font-medium text-slate-300">{item.q}</dt>
            <dd className="mt-0.5">{item.a}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5">
        <Link href="/onboarding" className="font-medium text-indigo-400 hover:text-indigo-300">
          Empezar simulacro Saber 11
        </Link>
        {" · "}
        <Link href="/ranking" className="font-medium text-indigo-400 hover:text-indigo-300">
          Ranking simulacros ICFES por colegio
        </Link>
      </p>
    </section>
  );
}

export const HOME_FAQ_SCHEMA = FAQ;
