/** Subconjunto MVP — ampliar con dataset oficial de colegios (MEN/SIMAT). */
export const UBICACIONES_COLOMBIA: Record<string, Record<string, string[]>> = {
  Antioquia: {
    Medellín: [
      "Colegio San José de las Vegas",
      "Instituto Técnico Central",
      "Liceo Salazar y Herrera",
      "Otro (escribir en apodo)",
    ],
    Envigado: ["Colegio Montessori", "Liceo Antioqueño", "Otro"],
    Bello: ["IE Alejandro Echavarría", "Colegio La Salle Bello", "Otro"],
  },
  Cundinamarca: {
    Soacha: ["IE El Sembrador", "Colegio Campestre Soacha", "Otro"],
    Chía: ["Colegio Los Nogales", "Gimnasio Campestre", "Otro"],
    Zipaquirá: ["Colegio Santo Tomás", "IE Salitre", "Otro"],
  },
  "Bogotá D.C.": {
    "Localidad Usaquén": ["Colegio Gimnasio Moderno", "Colegio Nueva Granada", "Otro"],
    "Localidad Kennedy": ["IE Ciudad Verde", "Colegio Americano", "Otro"],
    "Localidad Suba": ["Colegio Tilatá", "Liceo Femenino", "Otro"],
  },
  "Valle del Cauca": {
    Cali: ["Colegio Bolivariano", "Gimnasio Los Caobos", "IE Simón Bolívar", "Otro"],
    Palmira: ["Colegio Champagnat", "IE San José", "Otro"],
  },
  Atlántico: {
    Barranquilla: ["Colegio Karl C. Parrish", "Liceo de Cervantes", "Otro"],
    Soledad: ["IE Manuela Beltrán", "Colegio La Presentación", "Otro"],
  },
};

export const DEPARTAMENTOS = Object.keys(UBICACIONES_COLOMBIA).sort();

export function municipiosDe(departamento: string): string[] {
  const m = UBICACIONES_COLOMBIA[departamento];
  return m ? Object.keys(m).sort() : [];
}

export function colegiosDe(departamento: string, municipio: string): string[] {
  return UBICACIONES_COLOMBIA[departamento]?.[municipio] ?? [];
}
