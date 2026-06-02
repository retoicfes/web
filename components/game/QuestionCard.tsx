"use client";

import { QuestionTimer } from "@/components/game/QuestionTimer";
import type { OpcionLetra, PreguntaDTO } from "@/lib/game";
import { opcionTexto } from "@/lib/game";
import { useState } from "react";

type Props = {
  pregunta: PreguntaDTO;
  index: number;
  total: number;
  onAnswer: (letra: OpcionLetra) => void;
  disabled?: boolean;
  segundosRestantes?: number;
  timerPausado?: boolean;
};

export function QuestionCard({
  pregunta,
  index,
  total,
  onAnswer,
  disabled,
  segundosRestantes,
  timerPausado,
}: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  let startX = 0;

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX = e.touches[0].clientX;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || disabled) return;
    setOffsetX(e.touches[0].clientX - startX);
  };

  const onTouchEnd = () => {
    if (!dragging || disabled) return;
    setDragging(false);
    if (offsetX > 80) onAnswer("A");
    else if (offsetX < -80) onAnswer("D");
    setOffsetX(0);
  };

  const rotate = Math.max(-12, Math.min(12, offsetX / 20));

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
        className="relative flex flex-1 touch-pan-y flex-col rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-800 to-slate-900 p-5 shadow-xl transition-transform"
        style={{
          transform: `translateX(${offsetX}px) rotate(${rotate}deg)`,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <p className="text-lg font-semibold leading-snug">{pregunta.enunciado}</p>
        <p className="mt-auto pt-6 text-center text-xs text-slate-500">
          ⏱️ Responde antes de que se acabe el tiempo · desliza → A · ← D
        </p>
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
