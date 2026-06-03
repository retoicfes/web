"use client";

import { MobileShell } from "@/components/ui/MobileShell";
import { clearRoundComplete } from "@/lib/round";
import { savePlayerSession, type PlayerSession } from "@/lib/session";
import { unlockTimerAudio } from "@/lib/timer-sound";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Depto = { codigoDane: string; nombre: string };
type Muni = { codigoDane: string; nombre: string };
type ColegioHit = {
  codigo: string;
  nombre: string;
  estado: string | null;
  sedes: number;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [apodo, setApodo] = useState("");
  const [departamentos, setDepartamentos] = useState<Depto[]>([]);
  const [municipios, setMunicipios] = useState<Muni[]>([]);
  const [colegios, setColegios] = useState<ColegioHit[]>([]);

  const [daneDepto, setDaneDepto] = useState("");
  const [nombreDepto, setNombreDepto] = useState("");
  const [daneMuni, setDaneMuni] = useState("");
  const [nombreMuni, setNombreMuni] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [codigoColegio, setCodigoColegio] = useState("");
  const [nombreColegio, setNombreColegio] = useState("");

  const [cargandoDeptos, setCargandoDeptos] = useState(true);
  const [cargandoMunis, setCargandoMunis] = useState(false);
  const [cargandoColegios, setCargandoColegios] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/colegios/departamentos")
      .then((r) => r.json())
      .then((d: { departamentos?: Depto[] }) => {
        setDepartamentos(d.departamentos ?? []);
        if (!d.departamentos?.length) {
          setErrorApi(
            "Aún no hay colegios en la base de datos. Ejecuta pnpm db:import-colegios en el servidor.",
          );
        }
      })
      .catch(() => setErrorApi("No se pudieron cargar los departamentos."))
      .finally(() => setCargandoDeptos(false));
  }, []);

  useEffect(() => {
    if (!daneDepto) {
      setMunicipios([]);
      return;
    }
    setCargandoMunis(true);
    fetch(`/api/colegios/municipios?daneDepto=${encodeURIComponent(daneDepto)}`)
      .then((r) => r.json())
      .then((d: { municipios?: Muni[] }) => setMunicipios(d.municipios ?? []))
      .catch(() => setMunicipios([]))
      .finally(() => setCargandoMunis(false));
  }, [daneDepto]);

  const buscarColegios = useCallback(async (dane: string, q: string) => {
    if (!dane) return;
    setCargandoColegios(true);
    const params = new URLSearchParams({ daneMuni: dane, activos: "1", limit: "30" });
    if (q.trim().length >= 2) params.set("q", q.trim());
    try {
      const res = await fetch(`/api/colegios/buscar?${params}`);
      const d = (await res.json()) as { colegios?: ColegioHit[] };
      setColegios(d.colegios ?? []);
    } catch {
      setColegios([]);
    } finally {
      setCargandoColegios(false);
    }
  }, []);

  useEffect(() => {
    if (!daneMuni) {
      setColegios([]);
      return;
    }
    const t = setTimeout(() => void buscarColegios(daneMuni, busqueda), 300);
    return () => clearTimeout(t);
  }, [daneMuni, busqueda, buscarColegios]);

  const canSubmit =
    apodo.trim().length >= 2 &&
    daneDepto &&
    daneMuni &&
    codigoColegio &&
    nombreColegio;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const session: PlayerSession = {
      apodo: apodo.trim(),
      departamento: nombreDepto,
      municipio: nombreMuni,
      colegio: nombreColegio,
      daneDepartamento: daneDepto,
      daneMunicipio: daneMuni,
      codigoEstablecimiento: codigoColegio,
    };
    savePlayerSession(session);
    clearRoundComplete();
    void unlockTimerAudio();
    router.push("/jugar");
  };

  const selectClass =
    "w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-base outline-none focus:border-indigo-500";

  return (
    <MobileShell
      title="¿Quién juega?"
      subtitle="Elige tu colegio oficial (datos DANE). Solo apodo — sin correo."
      backHref="/"
    >
      <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
        {errorApi && (
          <p className="rounded-lg border border-amber-600/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
            {errorApi}
          </p>
        )}

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
            value={daneDepto}
            disabled={cargandoDeptos}
            onChange={(e) => {
              const cod = e.target.value;
              const d = departamentos.find((x) => x.codigoDane === cod);
              setDaneDepto(cod);
              setNombreDepto(d?.nombre ?? "");
              setDaneMuni("");
              setNombreMuni("");
              setCodigoColegio("");
              setNombreColegio("");
              setBusqueda("");
            }}
            className={selectClass}
          >
            <option value="">
              {cargandoDeptos ? "Cargando…" : "Selecciona…"}
            </option>
            {departamentos.map((d) => (
              <option key={d.codigoDane} value={d.codigoDane}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Municipio</span>
          <select
            value={daneMuni}
            disabled={!daneDepto || cargandoMunis}
            onChange={(e) => {
              const cod = e.target.value;
              const m = municipios.find((x) => x.codigoDane === cod);
              setDaneMuni(cod);
              setNombreMuni(m?.nombre ?? "");
              setCodigoColegio("");
              setNombreColegio("");
              setBusqueda("");
            }}
            className={selectClass}
          >
            <option value="">
              {!daneDepto
                ? "Primero departamento"
                : cargandoMunis
                  ? "Cargando…"
                  : "Selecciona…"}
            </option>
            {municipios.map((m) => (
              <option key={m.codigoDane} value={m.codigoDane}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Buscar colegio</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={!daneMuni}
            placeholder={
              daneMuni
                ? "Escribe al menos 2 letras del nombre…"
                : "Primero el municipio"
            }
            className={selectClass}
          />
        </label>

        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-700">
          {!daneMuni ? (
            <p className="p-3 text-sm text-slate-500">Elige municipio para ver colegios activos.</p>
          ) : cargandoColegios ? (
            <p className="p-3 text-sm text-slate-400">Buscando…</p>
          ) : colegios.length === 0 ? (
            <p className="p-3 text-sm text-slate-500">
              {busqueda.trim().length >= 2
                ? "Sin resultados. Prueba otro nombre."
                : "Escribe en el buscador o desplázate en la lista."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {colegios.map((c) => (
                <li key={c.codigo}>
                  <button
                    type="button"
                    onClick={() => {
                      setCodigoColegio(c.codigo);
                      setNombreColegio(c.nombre);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-sm transition ${
                      codigoColegio === c.codigo
                        ? "bg-indigo-600/30 text-white"
                        : "text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <span className="font-medium">{c.nombre}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Cód. {c.codigo}
                      {c.sedes > 1 ? ` · ${c.sedes} sedes` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {nombreColegio && (
          <p className="text-sm text-indigo-300">
            Seleccionado: <strong>{nombreColegio}</strong>
          </p>
        )}

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
