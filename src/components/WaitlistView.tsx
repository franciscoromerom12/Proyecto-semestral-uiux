import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export function WaitlistView() {
  const { state } = useStore();
  const { waitlist, volunteers, zones } = state;

  const zoneMap = new Map(zones.map(z => [z.id, z.nombre]));
  const volMap = new Map(volunteers.map(v => [v.id, v]));

  const sorted = [...waitlist].sort((a, b) => a.prioridad - b.prioridad);

  if (sorted.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No hay voluntarios en lista de espera.</p>;
  }

  return (
    <div className="rounded-lg border overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-center p-3 font-medium text-muted-foreground">Prioridad</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Nombre</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Correo</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Zona Solicitada</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(entry => {
            const vol = volMap.get(entry.voluntarioId);
            if (!vol) return null;
            return (
              <tr key={entry.id} className="border-t">
                <td className="p-3 text-center">
                  <Badge variant="outline" className="bg-status-waiting-bg text-status-waiting-foreground border-0">{entry.prioridad}</Badge>
                </td>
                <td className="p-3 font-medium">{vol.nombre}</td>
                <td className="p-3 text-muted-foreground">{vol.correo}</td>
                <td className="p-3">{zoneMap.get(entry.zonaId) || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
