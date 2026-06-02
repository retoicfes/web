"use client";

import { useCallback, useEffect, useState } from "react";

export type UbicacionRanking = {
  departamento: string;
  municipio: string;
  colegio: string;
};

type Depto = { codigoDane: string; nombre: string };
type Muni = { codigoDane: string; nombre: string };
type ColegioHit = { codigo: string; nombre: string; sedes: number };

type Props = {
  onSeleccionar: (ubicacion: UbicacionRanking) => void;
  className?: string;
};

const selectClass =
  "w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

export function RankingUbicacionPicker({ onSeleccionar, className = "" }: Props) {
  const [departamentos, setDepartamentos] = useState<Depto[]>([]);
  const [municipios, setMunicipios] = useState<Muni[]>([]);
  const [colegios, setColegios] = useState<ColegioHit[]>([]);

  const [daneDepto, setDaneDepto] = useState("");
  const [nombreDepto, setNombreDepto] = useState("");
  const [daneMuni, setDaneMuni] = useState("");
  const [nombreMuni, setNombreMuni] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/colegios/departamentos")
      .then((r) => r.json())
      .then((d: { departamentos?: Depto[] }) => setDepartamentos(d.departamentos ?? []))
      .catch(() => setDepartamentos([]));
  }, []);

  useEffect(() => {
    if (!daneDepto) {
      setMunicipios([]);
      return;
    }
    fetch(`/api/colegios/municipios?daneDepto=${encodeURIComponent(daneDepto)}`)
      .then((r) => r.json())
      .then((d: { municipios?: Muni[] }) => setMunicipios(d.municipios ?? []))
      .catch(() => setMunicipios([]));
  }, [daneDepto]);

  const buscarColegios = useCallback(async (dane: string, q: string) => {
    if (!dane) return;
    const params = new URLSearchParams({ daneMuni: dane, activos: "1", limit: "25" });
    if (q.trim().length >= 2) params.set("q", q.trim());
    try {
      const res = await fetch(`/api/colegios/buscar?${params}`);
      const d = (await res.json()) as { colegios?: ColegioHit[] };
      setColegios(d.colegios ?? []);
    } catch {
      setColegios([]);
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

  return (
    <div
      className={`rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-4 ${className}`}
    >
      <p className="mb-3 text-sm font-medium text-slate-200">Buscar colegio</p>
      <div className="space-y-3">
        <select
          value={daneDepto}
          onChange={(e) => {
            const cod = e.target.value;
            const d = departamentos.find((x) => x.codigoDane === cod);
            setDaneDepto(cod);
            setNombreDepto(d?.nombre ?? "");
            setDaneMuni("");
            setNombreMuni("");
            setBusqueda("");
          }}
          className={selectClass}
        >
          <option value="">Departamento</option>
          {departamentos.map((d) => (
            <option key={d.codigoDane} value={d.codigoDane}>
              {d.nombre}
            </option>
          ))}
        </select>

        <select
          value={daneMuni}
          disabled={!daneDepto}
          onChange={(e) => {
            const cod = e.target.value;
            const m = municipios.find((x) => x.codigoDane === cod);
            setDaneMuni(cod);
            setNombreMuni(m?.nombre ?? "");
            setBusqueda("");
          }}
          className={selectClass}
        >
          <option value="">{daneDepto ? "Municipio" : "Primero departamento"}</option>
          {municipios.map((m) => (
            <option key={m.codigoDane} value={m.codigoDane}>
              {m.nombre}
            </option>
          ))}
        </select>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          disabled={!daneMuni}
          placeholder={daneMuni ? "Nombre del colegio…" : "Primero municipio"}
          className={selectClass}
        />

        {daneMuni && colegios.length > 0 ? (
          <ul className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-slate-700">
            {colegios.map((c) => (
              <li key={c.codigo}>
                <button
                  type="button"
                  onClick={() =>
                    onSeleccionar({
                      departamento: nombreDepto,
                      municipio: nombreMuni,
                      colegio: c.nombre,
                    })
                  }
                  className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  {c.nombre}
                </button>
              </li>
            ))}
          </ul>
        ) : daneMuni && busqueda.length >= 2 ? (
          <p className="text-xs text-slate-500">Sin colegios con ese nombre.</p>
        ) : null}
      </div>
    </div>
  );
}
