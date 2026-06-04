import Link from "next/link";

const FAQ = [
  {
    q: "¿Qué es Reto ICFES?",
    a: "Es un simulacro gratuito de Pruebas Saber 11 para estudiantes de grado 11° en Colombia. Practica con preguntas tipo ICFES en formato rápido y compite en el ranking de tu colegio.",
  },
  {
    q: "¿Cuántas áreas del Saber 11 incluye?",
    a: "Cada ronda tiene 15 preguntas: 3 por área en Matemáticas, Lectura Crítica, Sociales y Ciencias Naturales, e Inglés, alineadas al enfoque del examen de Estado.",
  },
  {
    q: "¿Necesito registrarme con correo?",
    a: "No. Solo eliges tu colegio (datos DANE), un apodo y empiezas. Puedes compartir tu puntaje y retar a tu curso por WhatsApp.",
  },
  {
    q: "¿Cómo funciona el ranking?",
    a: "Al terminar la ronda tu mejor puntaje puede guardarse en el ranking de tu colegio, municipio, departamento y a nivel nacional.",
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
        Practica Saber 11 e ICFES gratis en Colombia
      </h2>
      <p className="mb-3">
        <strong className="font-semibold text-slate-300">Reto ICFES</strong> te ayuda a
        prepararte para las Pruebas Saber 11 con retos cortos, cronómetro y retroalimentación
        inmediata. Ideal para bachillerato, simulacros escolares y repaso antes del examen de
        grado 11°.
      </p>
      <ul className="mb-4 list-inside list-disc space-y-1 text-slate-500">
        <li>Simulacro ICFES tipo swipe en el celular</li>
        <li>Ranking por colegio, municipio y departamento</li>
        <li>Sin correo: apodo y establecimiento educativo</li>
        <li>15 preguntas por ronda (3 por cada área del Saber 11)</li>
        <li>Preguntas con contexto cuando el ítem lo requiere</li>
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
        <Link href="/ranking" className="font-medium text-indigo-400 hover:text-indigo-300">
          Ver ranking de colegios
        </Link>
        {" · "}
        <Link href="/onboarding" className="font-medium text-indigo-400 hover:text-indigo-300">
          Configurar apodo y colegio
        </Link>
      </p>
    </section>
  );
}

export const HOME_FAQ_SCHEMA = FAQ;
