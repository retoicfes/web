/**
 * Importa establecimientos y sedes desde CSV oficiales (SIMAT/MEN).
 * Uso: pnpm db:import-colegios
 * CSV por defecto: ../ (repositories/Establecimientos - *.csv)
 */
import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";
import "./load-env";

const prisma = new PrismaClient();

const CSV_DIR = process.env.COLEGIOS_CSV_DIR ?? resolve(process.cwd(), "..");
const EST_PATH = resolve(CSV_DIR, "Establecimientos - Establecimientos.csv");
const SEDES_PATH = resolve(CSV_DIR, "Establecimientos - Sedes.csv.csv");

const BATCH = 800;

function normCodigo(v: string | undefined): string {
  return String(v ?? "").trim();
}

async function parseCsv(path: string): Promise<Record<string, string>[]> {
  const rows: Record<string, string>[] = [];
  await new Promise<void>((resolvePromise, reject) => {
    createReadStream(path, { encoding: "utf-8" })
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          relax_column_count: true,
        }),
      )
      .on("data", (row: Record<string, string>) => rows.push(row))
      .on("end", () => resolvePromise())
      .on("error", reject);
  });
  return rows;
}

async function main() {
  console.log("Leyendo CSV (puede tardar ~1 min)...");
  const estCsv = await parseCsv(EST_PATH);
  const sedesCsv = await parseCsv(SEDES_PATH);

  const deptos = new Map<string, string>();
  const munis = new Map<string, { nombre: string; depto: string }>();

  for (const row of estCsv) {
    const daneDepto = normCodigo(row["Código Departamento"]);
    const daneMuni = normCodigo(row["Código Municipio"]);
    if (!daneDepto || !daneMuni) continue;
    deptos.set(daneDepto, (row["Departamento"] ?? "").trim());
    munis.set(daneMuni, { nombre: (row["Municipio"] ?? "").trim(), depto: daneDepto });
  }

  console.log(`Únicos: ${deptos.size} deptos, ${munis.size} municipios, ${estCsv.length} establecimientos, ${sedesCsv.length} sedes`);

  await prisma.sede.deleteMany();
  await prisma.establecimiento.deleteMany();
  await prisma.municipio.deleteMany();
  await prisma.departamento.deleteMany();

  await prisma.departamento.createMany({
    data: [...deptos.entries()].map(([codigoDane, nombre]) => ({ codigoDane, nombre })),
  });

  const deptoIds = new Map(
    (await prisma.departamento.findMany({ select: { id: true, codigoDane: true } })).map((d) => [
      d.codigoDane,
      d.id,
    ]),
  );

  await prisma.municipio.createMany({
    data: [...munis.entries()].map(([codigoDane, m]) => ({
      codigoDane,
      nombre: m.nombre,
      departamentoId: deptoIds.get(m.depto)!,
    })),
  });

  const muniIds = new Map(
    (await prisma.municipio.findMany({ select: { id: true, codigoDane: true } })).map((m) => [
      m.codigoDane,
      m.id,
    ]),
  );

  type EstRow = {
    codigo: string;
    nombre: string;
    municipioId: string;
    estado: string | null;
    sector: string | null;
    zona: string | null;
    numeroSedes: number | null;
  };

  const estData: EstRow[] = [];
  for (const row of estCsv) {
    const codigo = normCodigo(row["Código"]);
    const daneMuni = normCodigo(row["Código Municipio"]);
    if (!codigo || !muniIds.has(daneMuni)) continue;
    estData.push({
      codigo,
      nombre: (row["Nombre"] ?? "").trim().slice(0, 500),
      municipioId: muniIds.get(daneMuni)!,
      estado: (row["Estado"] ?? "").trim() || null,
      sector: (row["Sector"] ?? "").trim() || null,
      zona: (row["Zona"] ?? "").trim() || null,
      numeroSedes: row["Número de Sedes"] ? Number(row["Número de Sedes"]) || null : null,
    });
  }

  for (let i = 0; i < estData.length; i += BATCH) {
    await prisma.establecimiento.createMany({
      data: estData.slice(i, i + BATCH),
      skipDuplicates: true,
    });
    process.stdout.write(`\rEstablecimientos: ${Math.min(i + BATCH, estData.length)}/${estData.length}`);
  }
  console.log("\nEstablecimientos listos.");

  const estMap = new Map(
    (await prisma.establecimiento.findMany({ select: { id: true, codigo: true } })).map((e) => [
      e.codigo,
      e.id,
    ]),
  );

  const sedesData: {
    codigo: string;
    nombre: string;
    establecimientoId: string;
    zona: string | null;
    direccion: string | null;
    telefono: string | null;
    estado: string | null;
  }[] = [];

  let omitidas = 0;
  for (const row of sedesCsv) {
    const codigoEst = normCodigo(row["Código Establecimiento"]);
    const codigo = normCodigo(row["Código Sede"]);
    const establecimientoId = estMap.get(codigoEst);
    if (!codigo || !establecimientoId) {
      omitidas++;
      continue;
    }
    sedesData.push({
      codigo,
      nombre: (row["Nombre Sede"] ?? "").trim().slice(0, 500),
      establecimientoId,
      zona: (row["Zona"] ?? "").trim() || null,
      direccion: (row["Dirección"] ?? "").trim().slice(0, 500) || null,
      telefono: (row["Teléfono"] ?? "").trim().slice(0, 80) || null,
      estado: (row["Estado Sede"] ?? "").trim() || null,
    });
  }

  for (let i = 0; i < sedesData.length; i += BATCH) {
    await prisma.sede.createMany({
      data: sedesData.slice(i, i + BATCH),
      skipDuplicates: true,
    });
    process.stdout.write(`\rSedes: ${Math.min(i + BATCH, sedesData.length)}/${sedesData.length}`);
  }
  console.log(`\nSedes listas. Omitidas: ${omitidas}`);

  console.log("Resumen DB:", {
    departamentos: await prisma.departamento.count(),
    municipios: await prisma.municipio.count(),
    establecimientos: await prisma.establecimiento.count(),
    sedes: await prisma.sede.count(),
    establecimientosActivos: await prisma.establecimiento.count({
      where: { estado: { contains: "ACTIVO", mode: "insensitive" } },
    }),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
