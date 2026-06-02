"use client";

import { FeedbackOverlay } from "@/components/game/FeedbackOverlay";
import { QuestionCard } from "@/components/game/QuestionCard";
import { MobileShell } from "@/components/ui/MobileShell";
import {
  PREGUNTAS_POR_RONDA,
  PUNTOS_POR_ACIERTO,
  fraseAlFallar,
  type OpcionLetra,
  type PreguntaDTO,
} from "@/lib/game";
import { getPlayerSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PreguntaConRespuesta = PreguntaDTO & { correcta: string; explicacion: string };

export default function JugarPage() {
  const router = useRouter();
  const [preguntas, setPreguntas] = useState<PreguntaConRespuesta[]>([]);
  const [index, setIndex] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    correcto: boolean;
    explicacion: string;
    fraseExtra?: string;
  } | null>(null);
  const [locked, setLocked] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!getPlayerSession()) {
      router.replace("/onboarding");
      return;
    }
    fetch(`/api/preguntas?limit=${PREGUNTAS_POR_RONDA}`)
      .then((r) => r.json())
      .then((data: { preguntas: PreguntaConRespuesta[] }) => {
        if (!data.preguntas?.length) throw new Error("Sin preguntas");
        setPreguntas(data.preguntas);
      })
      .catch(() => router.replace("/onboarding"))
      .finally(() => setLoading(false));
  }, [router]);

  const finalizar = useCallback(
    async (puntajeFinal: number) => {
      const session = getPlayerSession();
      if (!session) return;
      setGuardando(true);
      try {
        const res = await fetch("/api/rankings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...session, puntaje: puntajeFinal }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          router.replace(
            `/resultado?puntaje=${puntajeFinal}&saveError=${encodeURIComponent(err.error ?? "Error al guardar")}`,
          );
          return;
        }
      } catch {
        router.replace(`/resultado?puntaje=${puntajeFinal}&saveError=red`);
        return;
      }
      router.replace(`/resultado?puntaje=${puntajeFinal}&saved=1`);
    },
    [router],
  );

  const responder = (letra: OpcionLetra) => {
    if (locked || !preguntas[index]) return;
    setLocked(true);
    const actual = preguntas[index];
    const correcto = actual.correcta.toUpperCase() === letra;
    const nuevoPuntaje = correcto ? puntaje + PUNTOS_POR_ACIERTO : puntaje;

    setFeedback({
      correcto,
      explicacion: actual.explicacion,
      fraseExtra: correcto ? undefined : fraseAlFallar(),
    });
    setPuntaje(nuevoPuntaje);

    setTimeout(() => {
      setFeedback(null);
      const siguiente = index + 1;
      if (siguiente >= preguntas.length) {
        finalizar(nuevoPuntaje);
        return;
      }
      setIndex(siguiente);
      setLocked(false);
    }, 1400);
  };

  if (loading || guardando) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="animate-pulse text-slate-400">
          {guardando ? "Guardando tu puntaje…" : "Preparando preguntas…"}
        </p>
      </div>
    );
  }

  const actual = preguntas[index];
  if (!actual) return null;

  return (
    <MobileShell
      title={getPlayerSession()?.apodo ?? "Reto"}
      subtitle={`Puntaje: ${puntaje} pts`}
      backHref="/"
    >
      <QuestionCard
        pregunta={actual}
        index={index}
        total={preguntas.length}
        onAnswer={responder}
        disabled={locked}
      />
      {feedback ? (
        <FeedbackOverlay
          correcto={feedback.correcto}
          explicacion={feedback.explicacion}
          fraseExtra={feedback.fraseExtra}
        />
      ) : null}
    </MobileShell>
  );
}
