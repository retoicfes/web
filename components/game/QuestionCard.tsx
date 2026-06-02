"use client";

import { QuestionTimer } from "@/components/game/QuestionTimer";
import type { OpcionLetra, PreguntaDTO } from "@/lib/game";
import { opcionTexto } from "@/lib/game";
import { useRef, useState } from "react";

const UMBRAL_DESLIZ = 72;

type Props = {
  pregunta: PreguntaDTO;
  index: number;
  total: number;
  onAnswer: (letra: OpcionLetra) => void;
  disabled?: boolean;
  segundosRestantes?: number;
  timerPausado?: boolean;
};

function letraPorDesliz(dx: number, dy: number): OpcionLetra | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < UMBRAL_DESLIZ) return null;
  if (ax >= ay) {
    if (dx < 0) return "A";
    return "C";
  }
  if (dy < 0) return "B";
  return "D";
}

export function QuestionCard({
  pregunta,
  index,
  total,
  onAnswer,
  disabled,
  segundosRestantes,
  timerPausado,
}: Props) {
  const startRef = useRef({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || disabled) return;
    setOffset({
      x: e.touches[0].clientX - startRef.current.x,
      y: e.touches[0].clientY - startRef.current.y,
    });
  };

  const onTouchEnd = () => {
    if (!dragging || disabled) return;
    setDragging(false);
    const letra = letraPorDesliz(offset.x, offset.y);
    if (letra) onAnswer(letra);
    setOffset({ x: 0, y: 0 });
  };

  const rotate = Math.max(-10, Math.min(10, offset.x / 24));

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        <span className="rounded-full bg-slate-800 px-3 py-1 font-medium text-indigo-300">
          {pregunta.materia}
        </span>
        <span className="shrink-0 tabular-nums">
          {index + 1} / {total}
        </span>
      </div>

      {segundosRestantes != null ? (
        <QuestionTimer segundosRestantes={segundosRestantes} pausado={timerPausado} />
      ) : null}

      <div
        className="relative flex min-h-[11rem] flex-1 touch-none flex-col rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-800 to-slate-900 p-5 shadow-xl transition-transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotate}deg)`,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden">
          {pregunta.contexto ? (
            <div className="max-h-32 w-full shrink-0 overflow-y-auto rounded-xl border border-slate-700/80 bg-slate-950/50 p-3 text-left">
              {pregunta.contexto.titulo ? (
                <p className="mb-1 text-xs font-semibold text-indigo-300">
                  {pregunta.contexto.titulo}
                  {pregunta.ordenEnContexto
                    ? ` · Pregunta ${pregunta.ordenEnContexto}`
                    : ""}
                </p>
              ) : null}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {pregunta.contexto.contenido}
              </p>
            </div>
          ) : null}
          <p className="text-center text-lg font-semibold leading-snug">{pregunta.enunciado}</p>
          <p className="max-w-[280px] text-center text-xs leading-relaxed text-slate-500">
            <span className="text-slate-400">⏱️ Desliza la tarjeta:</span>
            <br />
            <span className="mt-1 inline-block">
              <span className="text-indigo-300/90">← A</span>
              <span className="mx-1.5 text-slate-600">·</span>
              <span className="text-indigo-300/90">↑ B</span>
              <span className="mx-1.5 text-slate-600">·</span>
              <span className="text-indigo-300/90">→ C</span>
              <span className="mx-1.5 text-slate-600">·</span>
              <span className="text-indigo-300/90">↓ D</span>
            </span>
            <br />
            <span className="text-slate-600">o elige un botón abajo</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["A", "B", "C", "D"] as OpcionLetra[]).map((letra) => (
          <button
            key={letra}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(letra)}
            className="rounded-2xl border border-slate-600 bg-slate-800/80 px-3 py-4 text-left text-sm font-medium transition active:scale-95 disabled:opacity-50"
          >
            <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
              {letra}
            </span>
            <span className="line-clamp-2">{opcionTexto(pregunta, letra)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
