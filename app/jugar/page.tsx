"use client";

import { FeedbackOverlay } from "@/components/game/FeedbackOverlay";
import { QuestionCard } from "@/components/game/QuestionCard";
import { MobileShell } from "@/components/ui/MobileShell";
import type { ResultadoICFES } from "@/lib/icfes-puntaje";
import {
  PREGUNTAS_POR_RONDA,
  SEGUNDOS_ALERTA_TIMER,
  SEGUNDOS_POR_PREGUNTA,
  fraseAlFallar,
  type OpcionLetra,
  type PreguntaDTO,
} from "@/lib/game";
import { playAlertaTimer } from "@/lib/timer-sound";
import { clearRoundComplete, getCompletedRound, markRoundComplete } from "@/lib/round";
import { getPlayerSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

type RespuestaEnvio = { preguntaId: string; letra: OpcionLetra | null };

function JugarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nuevaRonda = searchParams.get("nueva") === "1";
  const [preguntas, setPreguntas] = useState<PreguntaDTO[]>([]);
  const [rondaToken, setRondaToken] = useState<string | null>(null);
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
  const respuestasRef = useRef<RespuestaEnvio[]>([]);
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
    fetch("/api/ronda/iniciar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: PREGUNTAS_POR_RONDA }),
    })
      .then((r) => r.json())
      .then((data: { token?: string; preguntas?: PreguntaDTO[]; error?: string }) => {
        if (!data.token || !data.preguntas?.length) throw new Error(data.error ?? "Sin preguntas");
        respuestasRef.current = [];
        setAciertos(0);
        setRespondidas(0);
        setRondaToken(data.token);
        setPreguntas(data.preguntas);
      })
      .catch(() => router.replace("/onboarding"))
      .finally(() => setLoading(false));
  }, [router, nuevaRonda]);

  const finalizar = useCallback(
    async (resultado: ResultadoICFES, rankingToken: string) => {
      const session = getPlayerSession();
      if (!session) return;
      markRoundComplete(resultado);
      setGuardando(true);
      const global = resultado.puntajeGlobal;
      try {
        const res = await fetch("/api/rankings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...session, puntaje: global, rankingToken }),
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

  const avanzarPregunta = useCallback(
    (correcto: boolean) => {
      setRespondidas((n) => n + 1);
      if (correcto) setAciertos((n) => n + 1);

      setTimeout(() => {
        setFeedback(null);
        const siguiente = index + 1;
        if (siguiente >= preguntas.length) {
          if (!rondaToken) return;
          void (async () => {
            try {
              const res = await fetch("/api/ronda/finalizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token: rondaToken,
                  respuestas: respuestasRef.current,
                }),
              });
              const data = (await res.json()) as {
                resultado?: ResultadoICFES;
                rankingToken?: string;
                error?: string;
              };
              if (!res.ok || !data.resultado || !data.rankingToken) {
                router.replace("/onboarding");
                return;
              }
              await finalizar(data.resultado, data.rankingToken);
            } catch {
              router.replace("/onboarding");
            }
          })();
          return;
        }
        setIndex(siguiente);
        setSegundosRestantes(SEGUNDOS_POR_PREGUNTA);
        setLocked(false);
      }, 1400);
    },
    [index, preguntas.length, rondaToken, finalizar, router],
  );

  const procesarRespuesta = useCallback(
    async (letra: OpcionLetra | null) => {
      if (locked || !preguntas[index] || !rondaToken) return;
      setLocked(true);
      const actual = preguntas[index];

      respuestasRef.current.push({ preguntaId: actual.id, letra });

      try {
        const res = await fetch("/api/ronda/responder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: rondaToken,
            preguntaId: actual.id,
            letra,
          }),
        });
        const data = (await res.json()) as {
          correcto?: boolean;
          explicacion?: string;
        };

        const correcto = Boolean(data.correcto);
        setFeedback({
          correcto,
          explicacion: data.explicacion ?? "",
          fraseExtra: correcto
            ? undefined
            : letra == null
              ? "⏱️ Se acabó el tiempo — la próxima la tienes"
              : fraseAlFallar(),
        });
        avanzarPregunta(correcto);
      } catch {
        setLocked(false);
      }
    },
    [locked, preguntas, index, rondaToken, avanzarPregunta],
  );

  const responder = useCallback(
    (letra: OpcionLetra) => void procesarRespuesta(letra),
    [procesarRespuesta],
  );

  useEffect(() => {
    if (loading || guardando || locked || !preguntas.length) return;

    setSegundosRestantes(SEGUNDOS_POR_PREGUNTA);
    let restante = SEGUNDOS_POR_PREGUNTA;

    const id = window.setInterval(() => {
      restante -= 1;
      setSegundosRestantes(restante);
      if (SEGUNDOS_ALERTA_TIMER.includes(restante as 5 | 3)) {
        playAlertaTimer(restante as 5 | 3);
      }
      if (restante <= 0) {
        window.clearInterval(id);
        void procesarRespuesta(null);
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
