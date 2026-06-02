"use client";

import { AREAS_ICFES } from "@/lib/icfes-puntaje";
import {
  DIFICULTADES_PREGUNTA,
  DIFICULTAD_DEFAULT,
  ETIQUETA_DIFICULTAD,
  LIMITES_CONTENIDO,
  type ContextoImportInput,
  type DificultadPregunta,
  type PreguntaImportInput,
} from "@/lib/admin/preguntas";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const ADMIN_KEY_STORAGE = "retoicfes_admin_key";

const PREGUNTA_VACIA = (): PreguntaImportInput => ({
  enunciado: "",
  opcionA: "",
  opcionB: "",
  opcionC: "",
  opcionD: "",
  correcta: "A",
  explicacion: "",
  dificultad: DIFICULTAD_DEFAULT,
  orden: 1,
});

const EJEMPLO_JSON: ContextoImportInput = {
  materia: "Lectura Crítica",
  titulo: "Fragmento sobre el agua en ciudades",
  contenido:
    "En las últimas décadas, varias metrópolis latinoamericanas han experimentado sequías prolongadas. Los expertos señalan que la planificación urbana debe integrar sistemas de captación de agua lluvia y reducir pérdidas en redes de acueducto…",
  preguntasItems: [
    {
      orden: 1,
      enunciado: "¿Cuál es la idea central del texto?",
      opcionA: "Las sequías son temporales",
      opcionB: "Hace falta mejor planificación del agua en ciudades",
      opcionC: "No hay problemas de acueducto",
      opcionD: "Solo afecta a una ciudad",
      correcta: "B",
      explicacion: "El texto enfatiza la necesidad de integrar soluciones urbanas.",
      dificultad: "media",
    },
  ],
};

function headers(key: string) {
  return { "Content-Type": "application/json", "x-admin-key": key };
}

export default function AdminPreguntasPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [tab, setTab] = useState<"contexto" | "suelta" | "json">("contexto");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalPreguntas: number;
    porDificultad?: Record<string, number>;
  } | null>(null);

  const [materia, setMateria] = useState<string>(AREAS_ICFES[0]);
  const [tituloContexto, setTituloContexto] = useState("");
  const [contenidoContexto, setContenidoContexto] = useState("");
  const [preguntasBloque, setPreguntasBloque] = useState<PreguntaImportInput[]>([
    PREGUNTA_VACIA(),
  ]);

  const [jsonTexto, setJsonTexto] = useState(JSON.stringify(EJEMPLO_JSON, null, 2));

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY_STORAGE);
    if (saved) setAdminKey(saved);
  }, []);

  const guardarKey = () => {
    sessionStorage.setItem(ADMIN_KEY_STORAGE, keyInput.trim());
    setAdminKey(keyInput.trim());
  };

  const cargarStats = useCallback(async () => {
    if (!adminKey) return;
    const res = await fetch("/api/admin/stats", { headers: headers(adminKey) });
    if (res.ok) {
      const d = (await res.json()) as {
        totalPreguntas: number;
        porDificultad?: Record<string, number>;
      };
      setStats(d);
    }
  }, [adminKey]);

  useEffect(() => {
    void cargarStats();
  }, [cargarStats]);

  const enviarContexto = async () => {
    setMensaje(null);
    const payload: ContextoImportInput = {
      materia,
      titulo: tituloContexto || undefined,
      contenido: contenidoContexto,
      preguntasItems: preguntasBloque.map((p, i) => ({ ...p, orden: p.orden ?? i + 1 })),
    };
    const res = await fetch("/api/admin/contextos", {
      method: "POST",
      headers: headers(adminKey),
      body: JSON.stringify(payload),
    });
    const d = (await res.json()) as { error?: string; contextoId?: string };
    if (!res.ok) {
      setMensaje(d.error ?? "Error al guardar");
      return;
    }
    setMensaje(`Contexto guardado (${d.contextoId?.slice(0, 8)}…)`);
    setTituloContexto("");
    setContenidoContexto("");
    setPreguntasBloque([PREGUNTA_VACIA()]);
    void cargarStats();
  };

  const enviarJson = async () => {
    setMensaje(null);
    try {
      const payload = JSON.parse(jsonTexto) as ContextoImportInput;
      const res = await fetch("/api/admin/contextos", {
        method: "POST",
        headers: headers(adminKey),
        body: JSON.stringify(payload),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMensaje(d.error ?? "Error");
        return;
      }
      setMensaje("JSON importado correctamente");
      void cargarStats();
    } catch {
      setMensaje("JSON inválido");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-indigo-500";

  if (!adminKey) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="text-xl font-bold">Admin · Preguntas</h1>
        <p className="text-sm text-slate-400">
          Solo local o con <code className="text-indigo-300">ADMIN_SECRET</code> en{" "}
          <code className="text-slate-500">.env.local</code>.
        </p>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Clave admin (vacío en local dev)"
          className={inputClass}
        />
        <button
          type="button"
          onClick={guardarKey}
          className="rounded-xl bg-indigo-500 py-3 font-bold text-white"
        >
          Entrar
        </button>
        <Link href="/" className="text-center text-sm text-slate-500">
          ← Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg p-4 pb-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Banco de preguntas</h1>
          <p className="text-xs text-slate-500">
            {stats ? `${stats.totalPreguntas} preguntas en DB` : "…"}
            {stats?.porDificultad
              ? ` · Fácil ${stats.porDificultad.facil ?? 0} · Media ${stats.porDificultad.media ?? 0} · Difícil ${stats.porDificultad.dificil ?? 0}`
              : null}{" "}
            · solo admin
          </p>
        </div>
        <Link href="/" className="text-sm text-indigo-400">
          Salir
        </Link>
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        {(
          [
            ["contexto", "Contexto + ítems"],
            ["json", "Importar JSON"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 ${tab === id ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mensaje ? (
        <p className="mb-3 rounded-lg bg-slate-800 px-3 py-2 text-sm text-green-400">{mensaje}</p>
      ) : null}

      {tab === "contexto" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-400">
            <strong className="text-slate-300">Formato recomendado:</strong> contexto largo OK
            (scroll). Enunciado corto (~280 caracteres). Opciones breves (~120 caracteres).
          </div>

          <label className="block">
            <span className="text-xs text-slate-500">Materia</span>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className={inputClass}
            >
              {AREAS_ICFES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-slate-500">Título del contexto (opcional)</span>
            <input
              value={tituloContexto}
              onChange={(e) => setTituloContexto(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-500">
              Contexto / texto base (hasta {LIMITES_CONTENIDO.contextoMax} caracteres)
            </span>
            <textarea
              value={contenidoContexto}
              onChange={(e) => setContenidoContexto(e.target.value)}
              rows={8}
              className={inputClass}
            />
          </label>

          {preguntasBloque.map((p, idx) => (
            <div key={idx} className="space-y-2 rounded-xl border border-slate-700 p-3">
              <p className="text-sm font-semibold text-indigo-300">Pregunta {idx + 1}</p>
              <textarea
                placeholder="Enunciado (pregunta concreta sobre el contexto)"
                value={p.enunciado}
                onChange={(e) => {
                  const next = [...preguntasBloque];
                  next[idx] = { ...next[idx], enunciado: e.target.value };
                  setPreguntasBloque(next);
                }}
                rows={2}
                className={inputClass}
              />
              {(["A", "B", "C", "D"] as const).map((letra) => (
                <input
                  key={letra}
                  placeholder={`Opción ${letra}`}
                  value={p[`opcion${letra}`]}
                  onChange={(e) => {
                    const next = [...preguntasBloque];
                    next[idx] = { ...next[idx], [`opcion${letra}`]: e.target.value };
                    setPreguntasBloque(next);
                  }}
                  className={inputClass}
                />
              ))}
              <div className="flex gap-2">
                <select
                  value={p.correcta}
                  onChange={(e) => {
                    const next = [...preguntasBloque];
                    next[idx] = { ...next[idx], correcta: e.target.value };
                    setPreguntasBloque(next);
                  }}
                  className={inputClass}
                >
                  {["A", "B", "C", "D"].map((l) => (
                    <option key={l} value={l}>
                      Correcta: {l}
                    </option>
                  ))}
                </select>
                <select
                  value={p.dificultad ?? DIFICULTAD_DEFAULT}
                  onChange={(e) => {
                    const next = [...preguntasBloque];
                    next[idx] = {
                      ...next[idx],
                      dificultad: e.target.value as DificultadPregunta,
                    };
                    setPreguntasBloque(next);
                  }}
                  className={inputClass}
                  title="Solo estadísticas internas; no afecta el puntaje"
                >
                  {DIFICULTADES_PREGUNTA.map((d) => (
                    <option key={d} value={d}>
                      {ETIQUETA_DIFICULTAD[d]}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Explicación breve"
                value={p.explicacion}
                onChange={(e) => {
                  const next = [...preguntasBloque];
                  next[idx] = { ...next[idx], explicacion: e.target.value };
                  setPreguntasBloque(next);
                }}
                rows={2}
                className={inputClass}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => setPreguntasBloque([...preguntasBloque, PREGUNTA_VACIA()])}
            className="w-full rounded-lg border border-slate-600 py-2 text-sm text-slate-300"
          >
            + Añadir pregunta al contexto
          </button>

          <button
            type="button"
            onClick={() => void enviarContexto()}
            className="w-full rounded-xl bg-indigo-500 py-3 font-bold text-white"
          >
            Guardar contexto y preguntas
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Pega JSON con <code className="text-slate-400">materia</code>,{" "}
            <code className="text-slate-400">contenido</code>,{" "}
            <code className="text-slate-400">preguntasItems</code> y opcional{" "}
            <code className="text-slate-400">dificultad</code> por ítem (
            <code className="text-slate-400">facil</code>,{" "}
            <code className="text-slate-400">media</code>,{" "}
            <code className="text-slate-400">dificil</code>).
          </p>
          <textarea
            value={jsonTexto}
            onChange={(e) => setJsonTexto(e.target.value)}
            rows={18}
            className={`${inputClass} font-mono text-xs`}
          />
          <button
            type="button"
            onClick={() => void enviarJson()}
            className="w-full rounded-xl bg-indigo-500 py-3 font-bold text-white"
          >
            Importar JSON
          </button>
        </div>
      )}
    </main>
  );
}
