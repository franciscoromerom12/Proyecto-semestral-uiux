import * as XLSX from "xlsx";
import type { AtributoEntity } from "@/lib/domain/atributos/types";
import type { VoluntarioEntity } from "@/lib/domain/voluntarios/types";
import type { ZonaEntity } from "@/lib/domain/zonas/types";

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, "_").replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u");
}

export function parseFileWithAtributos(
  file: File,
  atributos: AtributoEntity[],
): Promise<{ rows: Record<string, string>[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

        if (rawRows.length === 0) {
          resolve({ rows: [], errors: ["El archivo está vacío"] });
          return;
        }

        const headerRow = (rawRows[0] as unknown[]).map((h) => String(h ?? "").trim());
        const atributoColIndex: Record<string, number> = {};
        const errors: string[] = [];

        for (const atributo of atributos) {
          const colIdx = headerRow.findIndex(
            (h) => normalizeKey(h) === normalizeKey(atributo.nombre),
          );
          if (colIdx === -1) {
            if (atributo.requerido) {
              errors.push(`Columna requerida no encontrada: ${atributo.nombre}`);
            }
          } else {
            atributoColIndex[atributo.nombre] = colIdx;
          }
        }

        if (errors.length > 0) {
          resolve({ rows: [], errors });
          return;
        }

        const rows: Record<string, string>[] = [];
        for (const rawRow of rawRows.slice(1)) {
          const row = rawRow as unknown[];
          const record: Record<string, string> = {};
          for (const atributo of atributos) {
            const colIdx = atributoColIndex[atributo.nombre];
            if (colIdx === undefined) { record[atributo.nombre] = ""; continue; }
            const value = row[colIdx];
            if (value == null) {
              record[atributo.nombre] = "";
            } else if (atributo.tipo === "fecha") {
              const str = String(value).trim();
              const parsed = new Date(str);
              if (!isNaN(parsed.getTime())) {
                record[atributo.nombre] = parsed.toISOString();
              } else {
                const num = Number(str);
                if (!isNaN(num) && num > 1000) {
                  record[atributo.nombre] = new Date((num - 25569) * 86400 * 1000).toISOString();
                } else {
                  record[atributo.nombre] = str;
                }
              }
            } else {
              record[atributo.nombre] = String(value).trim();
            }
          }
          rows.push(record);
        }

        resolve({ rows, errors: [] });
      } catch (err) {
        resolve({ rows: [], errors: [`Error al procesar archivo: ${String(err)}`] });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function extractHeadersFromFile(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
        if (rows.length === 0) { resolve([]); return; }
        const headers = (rows[0] as unknown[]).map((h) => String(h ?? "").trim()).filter(Boolean);
        resolve(headers);
      } catch {
        resolve([]);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function exportarResultadosExcel(
  voluntarios: VoluntarioEntity[],
  zonas: ZonaEntity[],
  atributos: AtributoEntity[],
) {
  const zonaMap = new Map(zonas.map(z => [z.id, z.nombre]));
  const data = voluntarios.map(v => {
    const fila: Record<string, string> = {};
    for (const a of atributos) {
      fila[a.nombre] = v.datos[a.nombre] ?? "";
    }
    fila["Zona Asignada"] = v.zonaId ? (zonaMap.get(v.zonaId) ?? "") : "";
    fila["Estado"] = { asignado: "Asignado", lista_espera: "En Espera", no_asignado: "No Asignado" }[v.estado] ?? v.estado;
    return fila;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  XLSX.writeFile(wb, "asignacion_voluntarios.xlsx");
}
