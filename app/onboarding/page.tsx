"use client";

import { MobileShell } from "@/components/ui/MobileShell";
import {
  DEPARTAMENTOS,
  colegiosDe,
  municipiosDe,
} from "@/data/colombia";
import { savePlayerSession, type PlayerSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [apodo, setApodo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [colegio, setColegio] = useState("");

  const municipios = useMemo(
    () => (departamento ? municipiosDe(departamento) : []),
    [departamento],
  );
  const colegios = useMemo(
    () => (departamento && municipio ? colegiosDe(departamento, municipio) : []),
    [departamento, municipio],
  );

  const canSubmit =
    apodo.trim().length >= 2 && departamento && municipio && colegio;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const session: PlayerSession = {
      apodo: apodo.trim(),
      departamento,
      municipio,
      colegio,
    };
    savePlayerSession(session);
    router.push("/jugar");
  };

  const selectClass =
    "w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-base outline-none focus:border-indigo-500";

  return (
    <MobileShell
      title="¿Quién juega?"
      subtitle="Solo apodo y colegio — sin correo ni contraseña."
      backHref="/"
    >
      <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Tu apodo</span>
          <input
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
            maxLength={24}
            placeholder="Ej: MateMaster11"
            className={selectClass}
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Departamento</span>
          <select
            value={departamento}
            onChange={(e) => {
              setDepartamento(e.target.value);
              setMunicipio("");
              setColegio("");
            }}
            className={selectClass}
          >
            <option value="">Selecciona…</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Municipio</span>
          <select
            value={municipio}
            disabled={!departamento}
            onChange={(e) => {
              setMunicipio(e.target.value);
              setColegio("");
            }}
            className={selectClass}
          >
            <option value="">Selecciona…</option>
            {municipios.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Colegio</span>
          <select
            value={colegio}
            disabled={!municipio}
            onChange={(e) => setColegio(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecciona…</option>
            {colegios.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-auto rounded-2xl bg-indigo-500 py-4 text-lg font-bold text-white disabled:opacity-40"
        >
          Ir al reto →
        </button>
      </form>
    </MobileShell>
  );
}
