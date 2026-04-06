import * as XLSX from "xlsx";
import { Volunteer } from "./types";

const REQUIRED_COLUMNS = ["nombre", "correo", "sexo", "universidad", "carrera", "zona_preferida", "timestamp"];

const COLUMN_MAP: Record<string, string> = {
  nombre: "nombre",
  correo: "correo",
  email: "correo",
  sexo: "sexo",
  genero: "sexo",
  género: "sexo",
  universidad: "universidad",
  carrera: "carrera",
  zona_preferida: "zonaPreferida",
  zona: "zonaPreferida",
  zonapreferida: "zonaPreferida",
  timestamp: "timestamp",
  fecha: "timestamp",
  "marca temporal": "timestamp",
  "marca_temporal": "timestamp",
};

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, "_").replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u");
}

export function parseFile(file: File): Promise<{ volunteers: Volunteer[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (json.length === 0) {
          resolve({ volunteers: [], errors: ["El archivo está vacío"] });
          return;
        }

        const rawKeys = Object.keys(json[0]);
        const keyMapping: Record<string, string> = {};
        const errors: string[] = [];

        for (const raw of rawKeys) {
          const normalized = normalizeKey(raw);
          const mapped = COLUMN_MAP[normalized];
          if (mapped) keyMapping[raw] = mapped;
        }

        const mappedFields = new Set(Object.values(keyMapping));
        const requiredFields = ["nombre", "correo", "sexo", "universidad", "carrera", "zonaPreferida", "timestamp"];
        for (const field of requiredFields) {
          if (!mappedFields.has(field)) {
            errors.push(`Columna requerida no encontrada: ${field}`);
          }
        }

        if (errors.length > 0) {
          resolve({ volunteers: [], errors });
          return;
        }

        const volunteers: Volunteer[] = [];
        json.forEach((row, i) => {
          const vol: Record<string, unknown> = { id: crypto.randomUUID(), estado: "no_asignado", zonaAsignadaId: null };
          for (const [rawKey, field] of Object.entries(keyMapping)) {
            const value = row[rawKey];
            vol[field] = value != null ? String(value).trim() : "";
          }

          if (!vol.nombre || !vol.correo) {
            errors.push(`Fila ${i + 2}: nombre o correo vacío`);
            return;
          }

          // Try to parse timestamp
          if (vol.timestamp && typeof vol.timestamp === "string") {
            const parsed = new Date(vol.timestamp);
            if (!isNaN(parsed.getTime())) {
              vol.timestamp = parsed.toISOString();
            } else {
              // Try Excel serial date
              const num = Number(vol.timestamp);
              if (!isNaN(num) && num > 1000) {
                const excelDate = new Date((num - 25569) * 86400 * 1000);
                vol.timestamp = excelDate.toISOString();
              } else {
                vol.timestamp = new Date().toISOString();
              }
            }
          } else {
            vol.timestamp = new Date().toISOString();
          }

          volunteers.push(vol as unknown as Volunteer);
        });

        resolve({ volunteers, errors });
      } catch (err) {
        resolve({ volunteers: [], errors: [`Error al procesar archivo: ${String(err)}`] });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function exportToExcel(volunteers: Volunteer[], zones: { id: string; nombre: string }[]) {
  const zoneMap = new Map(zones.map(z => [z.id, z.nombre]));
  const data = volunteers.map(v => ({
    Nombre: v.nombre,
    Correo: v.correo,
    Sexo: v.sexo,
    Universidad: v.universidad,
    Carrera: v.carrera,
    "Zona Preferida": v.zonaPreferida,
    "Zona Asignada": v.zonaAsignadaId ? zoneMap.get(v.zonaAsignadaId) || "" : "",
    Estado: v.estado,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  XLSX.writeFile(wb, "asignacion_voluntarios.xlsx");
}
