import { useStore } from "@/lib/store";
import { getZoneStats } from "@/lib/assignment-engine";
import { reassignFromWaitlist } from "@/lib/assignment-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";

export function ZoneView() {
  const { state, updateState } = useStore();
  const { volunteers, zones, waitlist } = state;

  const handleRemove = (volunteerId: string, zoneId: string) => {
    const updated = volunteers.map(v =>
      v.id === volunteerId ? { ...v, estado: "cancelado" as const, zonaAsignadaId: null } : v
    );
    const result = reassignFromWaitlist(updated, zones, waitlist, zoneId);
    updateState({ volunteers: result.volunteers, waitlist: result.waitlist });
    toast.success("Voluntario removido y reasignación ejecutada");
  };

  if (zones.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No hay zonas configuradas.</p>;
  }

  return (
    <div className="space-y-6">
      {zones.map(zone => {
        const stats = getZoneStats(volunteers, zone.id);
        const assigned = volunteers.filter(v => v.zonaAsignadaId === zone.id && v.estado === "asignado");
        const pct = zone.cupoTotal > 0 ? Math.round((stats.total / zone.cupoTotal) * 100) : 0;

        return (
          <div key={zone.id} className="rounded-lg border bg-card overflow-hidden">
            <div className="p-5 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{zone.nombre}</h3>
                <Badge variant="outline">{stats.total} / {zone.cupoTotal}</Badge>
              </div>
              <div className="w-full rounded-full h-2 bg-secondary mt-3">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                <span>Hombres: {stats.hombres}/{zone.minHombres}</span>
                <span>Mujeres: {stats.mujeres}/{zone.minMujeres}</span>
                <span>PUC: {stats.puc}/{zone.minPUC}</span>
              </div>
            </div>
            {assigned.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Correo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Sexo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Universidad</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {assigned.map(v => (
                    <tr key={v.id} className="border-t">
                      <td className="p-3">{v.nombre}</td>
                      <td className="p-3 text-muted-foreground">{v.correo}</td>
                      <td className="p-3">{v.sexo}</td>
                      <td className="p-3">{v.universidad}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleRemove(v.id, zone.id)}>
                          <UserMinus className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-5 text-sm text-muted-foreground">Sin voluntarios asignados</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
