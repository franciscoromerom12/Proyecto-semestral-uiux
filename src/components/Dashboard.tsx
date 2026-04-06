import { useStore } from "@/lib/store";
import { getZoneStats, isPUC } from "@/lib/assignment-engine";
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function Dashboard() {
  const { state } = useStore();
  const { volunteers, zones } = state;

  const total = volunteers.filter(v => v.estado !== "cancelado").length;
  const asignados = volunteers.filter(v => v.estado === "asignado").length;
  const enEspera = volunteers.filter(v => v.estado === "espera").length;
  const noAsignados = volunteers.filter(v => v.estado === "no_asignado").length;

  const stats = [
    { label: "Total Voluntarios", value: total, icon: Users, color: "text-primary" },
    { label: "Asignados", value: asignados, icon: CheckCircle, color: "text-status-assigned" },
    { label: "En Espera", value: enEspera, icon: Clock, color: "text-status-waiting" },
    { label: "No Asignados", value: noAsignados, icon: AlertCircle, color: "text-status-unassigned" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <p className={`mt-2 text-3xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {zones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map(zone => {
            const zs = getZoneStats(volunteers, zone.id);
            const pct = zone.cupoTotal > 0 ? Math.round((zs.total / zone.cupoTotal) * 100) : 0;
            return (
              <div key={zone.id} className="rounded-lg border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-card-foreground">{zone.nombre}</h3>
                <div className="w-full rounded-full h-2 bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{zs.total} / {zone.cupoTotal} cupos</span>
                  <span>{pct}%</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>H: {zs.hombres}/{zone.minHombres}</span>
                  <span>M: {zs.mujeres}/{zone.minMujeres}</span>
                  <span>PUC: {zs.puc}/{zone.minPUC}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
