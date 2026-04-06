import { Volunteer, Zone, WaitlistEntry } from "./types";

function isPUC(universidad: string): boolean {
  return universidad.toUpperCase().includes("PUC") || universidad.toUpperCase().includes("PONTIFICIA UNIVERSIDAD CATÓLICA");
}

function isMale(sexo: string): boolean {
  const s = sexo.toLowerCase().trim();
  return s === "m" || s === "masculino" || s === "hombre" || s === "male";
}

function isFemale(sexo: string): boolean {
  const s = sexo.toLowerCase().trim();
  return s === "f" || s === "femenino" || s === "mujer" || s === "female";
}

interface ZoneStats {
  total: number;
  hombres: number;
  mujeres: number;
  puc: number;
}

function getZoneStats(volunteers: Volunteer[], zoneId: string): ZoneStats {
  const assigned = volunteers.filter(v => v.zonaAsignadaId === zoneId && v.estado === "asignado");
  return {
    total: assigned.length,
    hombres: assigned.filter(v => isMale(v.sexo)).length,
    mujeres: assigned.filter(v => isFemale(v.sexo)).length,
    puc: assigned.filter(v => isPUC(v.universidad)).length,
  };
}

function canAssign(volunteer: Volunteer, zone: Zone, stats: ZoneStats): boolean {
  if (stats.total >= zone.cupoTotal) return false;
  return true;
}

function needsForQuota(volunteer: Volunteer, zone: Zone, stats: ZoneStats): boolean {
  const remaining = zone.cupoTotal - stats.total;
  if (remaining <= 0) return false;

  const needH = Math.max(0, zone.minHombres - stats.hombres);
  const needM = Math.max(0, zone.minMujeres - stats.mujeres);
  const needP = Math.max(0, zone.minPUC - stats.puc);

  const totalNeeded = needH + needM + needP;
  if (totalNeeded >= remaining) {
    const isNeededH = isMale(volunteer.sexo) && needH > 0;
    const isNeededM = isFemale(volunteer.sexo) && needM > 0;
    const isNeededP = isPUC(volunteer.universidad) && needP > 0;
    if (!isNeededH && !isNeededM && !isNeededP) return false;
  }
  return true;
}

export function runAssignment(
  volunteers: Volunteer[],
  zones: Zone[]
): { volunteers: Volunteer[]; waitlist: WaitlistEntry[] } {
  const sorted = [...volunteers]
    .filter(v => v.estado !== "cancelado")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const result: Volunteer[] = volunteers.map(v => ({
    ...v,
    estado: v.estado === "cancelado" ? "cancelado" : "no_asignado",
    zonaAsignadaId: v.estado === "cancelado" ? v.zonaAsignadaId : null,
  }));

  const waitlist: WaitlistEntry[] = [];
  let prioCounter = 1;

  // Phase 1: Try preferred zone
  for (const vol of sorted) {
    const idx = result.findIndex(v => v.id === vol.id);
    if (result[idx].estado === "cancelado") continue;

    const preferredZone = zones.find(z =>
      z.nombre.toLowerCase().trim() === vol.zonaPreferida.toLowerCase().trim()
    );

    if (preferredZone) {
      const stats = getZoneStats(result, preferredZone.id);
      if (canAssign(vol, preferredZone, stats) && needsForQuota(vol, preferredZone, stats)) {
        result[idx] = { ...result[idx], estado: "asignado", zonaAsignadaId: preferredZone.id };
        continue;
      }
    }

    // Try any zone with space
    let assigned = false;
    for (const zone of zones) {
      const stats = getZoneStats(result, zone.id);
      if (canAssign(vol, zone, stats) && needsForQuota(vol, zone, stats)) {
        result[idx] = { ...result[idx], estado: "asignado", zonaAsignadaId: zone.id };
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      result[idx] = { ...result[idx], estado: "espera" };
      const targetZoneId = preferredZone?.id || zones[0]?.id || "";
      if (targetZoneId) {
        waitlist.push({
          id: crypto.randomUUID(),
          voluntarioId: vol.id,
          zonaId: targetZoneId,
          prioridad: prioCounter++,
        });
      }
    }
  }

  // Phase 2: Fill remaining spots from waitlist
  for (const zone of zones) {
    const stats = getZoneStats(result, zone.id);
    let remaining = zone.cupoTotal - stats.total;

    const zoneWaitlist = waitlist
      .filter(w => w.zonaId === zone.id)
      .sort((a, b) => a.prioridad - b.prioridad);

    for (const entry of zoneWaitlist) {
      if (remaining <= 0) break;
      const idx = result.findIndex(v => v.id === entry.voluntarioId);
      if (idx === -1 || result[idx].estado === "asignado") continue;

      const currentStats = getZoneStats(result, zone.id);
      if (canAssign(result[idx], zone, currentStats)) {
        result[idx] = { ...result[idx], estado: "asignado", zonaAsignadaId: zone.id };
        remaining--;
        const wIdx = waitlist.findIndex(w => w.id === entry.id);
        if (wIdx !== -1) waitlist.splice(wIdx, 1);
      }
    }
  }

  return { volunteers: result, waitlist };
}

export function reassignFromWaitlist(
  volunteers: Volunteer[],
  zones: Zone[],
  waitlist: WaitlistEntry[],
  zoneId: string
): { volunteers: Volunteer[]; waitlist: WaitlistEntry[] } {
  const zone = zones.find(z => z.id === zoneId);
  if (!zone) return { volunteers, waitlist };

  const result = [...volunteers];
  const newWaitlist = [...waitlist];
  const stats = getZoneStats(result, zoneId);
  let remaining = zone.cupoTotal - stats.total;

  const zoneWait = newWaitlist
    .filter(w => w.zonaId === zoneId)
    .sort((a, b) => a.prioridad - b.prioridad);

  for (const entry of zoneWait) {
    if (remaining <= 0) break;
    const idx = result.findIndex(v => v.id === entry.voluntarioId);
    if (idx === -1 || result[idx].estado === "asignado") continue;

    result[idx] = { ...result[idx], estado: "asignado", zonaAsignadaId: zoneId };
    remaining--;
    const wIdx = newWaitlist.findIndex(w => w.id === entry.id);
    if (wIdx !== -1) newWaitlist.splice(wIdx, 1);
  }

  return { volunteers: result, waitlist: newWaitlist };
}

export { getZoneStats, isPUC, isMale, isFemale };
export type { ZoneStats };
