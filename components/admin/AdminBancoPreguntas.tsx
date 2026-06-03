"use client";

import { AREAS_ICFES } from "@/lib/icfes-puntaje";
import {
  DIFICULTADES_PREGUNTA,
  DIFICULTAD_DEFAULT,
  ETIQUETA_DIFICULTAD,
  type DificultadPregunta,
  type PreguntaImportInput,
} from "@/lib/admin/preguntas";
import { useCallback, useEffect, useState } from "react";

type PreguntaListItem = {
  id: string;
  materia: string;
  enunciado: string;
  correcta: string;
  dificultad: string;
  contexto: string | null;
  orden: number | null;
};

type PreguntaDetalle = PreguntaImportInput & {
  id: string;
  materia: string;
  contextoId: string | null;
  ordenEnContexto: number | null;
  contexto: {
    id: string;
    titulo: string | null;
    contenido: string;
    materia: string;
  } | null;
};

type Props = {
  adminKey: string;
  headers: (key: string) => Record<string, string>;
  inputClass: string;
  onMensaje: (msg: string) => void;
  onActualizado: () => void;
};

export function AdminBancoPreguntas({ adminKey, headers, inputClass, onMensaje, onActualizado }: Props) {
  const [filtroMateria, setFiltroMateria] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [lista, setLista] = useState<PreguntaListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingLista, setLoadingLista] = useState(false);
  const [editando, setEditando] = useState<PreguntaDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargarLista = useCallback(async () => {
    if (!adminKey) return;
    setLoadingLista(true);
    const params = new URLSearchParams({ limit: "50" });
    if (filtroMateria) params.set("materia", filtroMateria);
    if (busqueda.trim()) params.set("q", busqueda.trim());

    try {
      const res = await fetch(`/api/admin/preguntas?${params}`, { headers: headers(adminKey) });
      const d = (await res.json()) as { preguntas?: PreguntaListItem[]; total?: number; error?: string };
      if (!res.ok) {
        onMensaje(d.error ?? "Error al listar");
        setLista([]);
        return;
      }
      setLista(d.preguntas ?? []);
      setTotal(d.total ?? 0);
    } catch {
      onMensaje("Error de red al listar");
    } finally {
      setLoadingLista(false);
    }
  }, [adminKey, filtroMateria, busqueda, headers, onMensaje]);

  useEffect(() => {
    void cargarLista();
  }, [cargarLista]);

  const abrirPregunta = async (id: string) => {
    setLoadingDetalle(true);
    onMensaje("");
    try {
      const res = await fetch(`/api/admin/preguntas/${id}`, { headers: headers(adminKey) });
      const d = (await res.json()) as { pregunta?: PreguntaDetalle; error?: string };
      if (!res.ok || !d.pregunta) {
        onMensaje(d.error ?? "No se pudo cargar");
        return;
      }
      const p = d.pregunta;
      setEditando({
        id: p.id,
        materia: p.materia,
        enunciado: p.enunciado,
        opcionA: p.opcionA,
        opcionB: p.opcionB,
        opcionC: p.opcionC,
        opcionD: p.opcionD,
        correcta: p.correcta,
        explicacion: p.explicacion,
        dificultad: (p.dificultad as DificultadPregunta) ?? DIFICULTAD_DEFAULT,
        contextoId: p.contextoId,
        ordenEnContexto: p.ordenEnContexto,
        contexto: p.contexto,
        orden: p.ordenEnContexto ?? undefined,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      onMensaje("Error al cargar pregunta");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const guardarEdicion = async () => {
    if (!editando?.id) return;
    setGuardando(true);
    onMensaje("");
    try {
      const res = await fetch(`/api/admin/preguntas/${editando.id}`, {
        method: "PATCH",
        headers: headers(adminKey),
        body: JSON.stringify({
          materia: editando.materia,
          enunciado: editando.enunciado,
          opcionA: editando.opcionA,
          opcionB: editando.opcionB,
          opcionC: editando.opcionC,
          opcionD: editando.opcionD,
          correcta: editando.correcta,
          explicacion: editando.explicacion,
          dificultad: editando.dificultad,
          ordenEnContexto: editando.ordenEnContexto,
        }),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) {
        onMensaje(d.error ?? "Error al guardar");
        return;
      }
      onMensaje("Pregunta actualizada ✓");
      void cargarLista();
      onActualizado();
    } catch {
      onMensaje("Error de red al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const actualizarCampo = <K extends keyof PreguntaDetalle>(key: K, value: PreguntaDetalle[K]) => {
    if (!editando) return;
    setEditando({ ...editando, [key]: value });
  };

  return (
    <div className="space-y-4">
      {editando?.id ? (
        <div className="space-y-3 rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-indigo-300">Editar pregunta</p>
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cerrar
            </button>
          </div>

          {editando.contexto ? (
            <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
              <p className="mb-1 text-xs font-semibold text-slate-400">
                Contexto vinculado
                {editando.contexto.titulo ? `: ${editando.contexto.titulo}` : ""}
              </p>
              <p className="max-h-24 overflow-y-auto whitespace-pre-wrap text-xs text-slate-400">
                {editando.contexto.contenido}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                El texto del contexto se edita creando un bloque nuevo; aquí solo cambias el ítem.
              </p>
            </div>
          ) : null}

          <label className="block">
            <span className="text-xs text-slate-500">Materia</span>
            <select
              value={editando.materia}
              onChange={(e) => actualizarCampo("materia", e.target.value)}
              className={inputClass}
            >
              {AREAS_ICFES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          {editando.contextoId ? (
            <label className="block">
              <span className="text-xs text-slate-500">Nº en contexto</span>
              <input
                type="number"
                min={1}
                value={editando.ordenEnContexto ?? ""}
                onChange={(e) =>
                  actualizarCampo(
                    "ordenEnContexto",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className={inputClass}
              />
            </label>
          ) : null}

          <textarea
            placeholder="Enunciado"
            value={editando.enunciado}
            onChange={(e) => actualizarCampo("enunciado", e.target.value)}
            rows={3}
            className={inputClass}
          />
          {(["A", "B", "C", "D"] as const).map((letra) => (
            <input
              key={letra}
              placeholder={`Opción ${letra}`}
              value={editando[`opcion${letra}`]}
              onChange={(e) => actualizarCampo(`opcion${letra}`, e.target.value)}
              className={inputClass}
            />
          ))}
          <div className="flex gap-2">
            <select
              value={editando.correcta}
              onChange={(e) => actualizarCampo("correcta", e.target.value)}
              className={inputClass}
            >
              {["A", "B", "C", "D"].map((l) => (
                <option key={l} value={l}>
                  Correcta: {l}
                </option>
              ))}
            </select>
            <select
              value={editando.dificultad ?? DIFICULTAD_DEFAULT}
              onChange={(e) =>
                actualizarCampo("dificultad", e.target.value as DificultadPregunta)
              }
              className={inputClass}
            >
              {DIFICULTADES_PREGUNTA.map((d) => (
                <option key={d} value={d}>
                  {ETIQUETA_DIFICULTAD[d]}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Explicación"
            value={editando.explicacion}
            onChange={(e) => actualizarCampo("explicacion", e.target.value)}
            rows={2}
            className={inputClass}
          />
          <button
            type="button"
            disabled={guardando || loadingDetalle}
            onClick={() => void guardarEdicion()}
            className="w-full rounded-xl bg-indigo-500 py-3 font-bold text-white disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={filtroMateria}
          onChange={(e) => setFiltroMateria(e.target.value)}
          className={`${inputClass} sm:w-40`}
        >
          <option value="">Todas las áreas</option>
          {AREAS_ICFES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en enunciado…"
          className={`${inputClass} flex-1`}
        />
        <button
          type="button"
          onClick={() => void cargarLista()}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white"
        >
          Buscar
        </button>
      </div>

      <p className="text-xs text-slate-500">
        {loadingLista ? "Cargando…" : `${lista.length} de ${total} preguntas`}
      </p>

      <ul className="max-h-80 space-y-2 overflow-y-auto">
        {lista.map((p) => (
          <li
            key={p.id}
            className="flex items-start gap-2 rounded-xl border border-slate-700 bg-slate-900/60 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-indigo-300/90">
                {p.materia}
                {p.contexto ? ` · ${p.contexto}` : ""}
                {p.orden ? ` · ítem ${p.orden}` : ""}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm text-slate-200">{p.enunciado}</p>
              <p className="mt-1 text-xs text-slate-500">
                Correcta {p.correcta} · {ETIQUETA_DIFICULTAD[p.dificultad as DificultadPregunta] ?? p.dificultad}
              </p>
            </div>
            <button
              type="button"
              disabled={loadingDetalle}
              onClick={() => void abrirPregunta(p.id)}
              className="shrink-0 rounded-lg bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-300"
            >
              Ver / editar
            </button>
          </li>
        ))}
        {!loadingLista && lista.length === 0 ? (
          <li className="py-6 text-center text-sm text-slate-500">Sin preguntas con ese filtro.</li>
        ) : null}
      </ul>
    </div>
  );
}
