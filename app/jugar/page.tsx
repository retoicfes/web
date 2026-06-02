"use client";

import { FeedbackOverlay } from "@/components/game/FeedbackOverlay";
import { QuestionCard } from "@/components/game/QuestionCard";
import { MobileShell } from "@/components/ui/MobileShell";
import { calcularResultadoICFES } from "@/lib/icfes-puntaje";
import {
  PREGUNTAS_POR_RONDA,
  SEGUNDOS_POR_PREGUNTA,
  fraseAlFallar,
  mezclarOpcionesPregunta,
  shuffleArray,
  type OpcionLetra,
  type PreguntaDTO,
} from "@/lib/game";
import { clearRoundComplete, getCompletedRound, markRoundComplete } from "@/lib/round";
import { getPlayerSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

type PreguntaConRespuesta = PreguntaDTO & { correcta: string; explicacion: string };

type RespuestaRegistro = { materia: string; correcta: boolean };

function JugarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nuevaRonda = searchParams.get("nueva") === "1";
  const [preguntas, setPreguntas] = useState<PreguntaConRespuesta[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    correcto: boolean;
    explicacion: string;
    fraseExtra?: string;
  } | null>(null);
  const [locked, setLocked] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(SEGUNDOS_POR_PREGUNTA);
  const respuestasRef = useRef<RespuestaRegistro[]>([]);
  const [aciertos, setAciertos] = useState(0);
  const [respondidas, setRespondidas] = useState(0);

  useEffect(() => {
    if (!getPlayerSession()) {
      router.replace("/onboarding");
      return;
    }
    if (nuevaRonda) {
      clearRoundComplete();
      respuestasRef.current = [];
      setAciertos(0);
      setRespondidas(0);
    } else if (getCompletedRound()) {
      router.replace("/ranking");
      return;
    }
    fetch(`/api/preguntas?limit=${PREGUNTAS_POR_RONDA}`)
      .then((r) => r.json())
      .then((data: { preguntas: PreguntaConRespuesta[] }) => {
        if (!data.preguntas?.length) throw new Error("Sin preguntas");
        respuestasRef.current = [];
        setAciertos(0);
        setRespondidas(0);
        setPreguntas(
          shuffleArray(data.preguntas).map((p) => mezclarOpcionesPregunta(p)),
        );
      })
      .catch(() => router.replace("/onboarding"))
      .finally(() => setLoading(false));
  }, [router, nuevaRonda]);

  const finalizar = useCallback(
    async (resultado: ReturnType<typeof calcularResultadoICFES>) => {
      const session = getPlayerSession();
      if (!session) return;
      markRoundComplete(resultado);
      setGuardando(true);
      const global = resultado.puntajeGlobal;
      try {
        const res = await fetch("/api/rankings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...session, puntaje: global }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          router.replace(
            `/resultado?puntaje=${global}&saveError=${encodeURIComponent(err.error ?? "Error al guardar")}`,
          );
          return;
        }
      } catch {
        router.replace(`/resultado?puntaje=${global}&saveError=red`);
        return;
      }
      router.replace(`/resultado?puntaje=${global}&saved=1`);
    },
    [router],
  );

  const avanzarPregunta = useCallback(() => {
    setTimeout(() => {
      setFeedback(null);
      const siguiente = index + 1;
      if (siguiente >= preguntas.length) {
        const resultado = calcularResultadoICFES(respuestasRef.current);
        void finalizar(resultado);
        return;
      }
      setIndex(siguiente);
      setSegundosRestantes(SEGUNDOS_POR_PREGUNTA);
      setLocked(false);
    }, 1400);
  }, [index, preguntas.length, finalizar]);

  const procesarRespuesta = useCallback(
    (letra: OpcionLetra | null) => {
      if (locked || !preguntas[index]) return;
      setLocked(true);
      const actual = preguntas[index];
      const correcto = letra != null && actual.correcta.toUpperCase() === letra;

      respuestasRef.current.push({ materia: actual.materia, correcta: correcto });
      setRespondidas((n) => n + 1);
      if (correcto) setAciertos((n) => n + 1);

      setFeedback({
        correcto,
        explicacion: actual.explicacion,
        fraseExtra: correcto
          ? undefined
          : letra == null
            ? "⏱️ Se acabó el tiempo — la próxima la tienes"
            : fraseAlFallar(),
      });
      avanzarPregunta();
    },
    [locked, preguntas, index, avanzarPregunta],
  );

  const responder = useCallback(
    (letra: OpcionLetra) => procesarRespuesta(letra),
    [procesarRespuesta],
  );

  useEffect(() => {
    if (loading || guardando || locked || !preguntas.length) return;

    setSegundosRestantes(SEGUNDOS_POR_PREGUNTA);
    let restante = SEGUNDOS_POR_PREGUNTA;

    const id = window.setInterval(() => {
      restante -= 1;
      setSegundosRestantes(restante);
      if (restante <= 0) {
        window.clearInterval(id);
        procesarRespuesta(null);
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [index, loading, guardando, locked, preguntas.length, procesarRespuesta]);

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
      subtitle={`${aciertos}/${respondidas} aciertos · escala ICFES 0–500`}
    >
      <QuestionCard
        pregunta={actual}
        index={index}
        total={preguntas.length}
        onAnswer={responder}
        disabled={locked}
        segundosRestantes={segundosRestantes}
        timerPausado={locked}
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

export default function JugarPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-slate-400">Cargando…</p>}>
      <JugarContent />
    </Suspense>
  );
}
