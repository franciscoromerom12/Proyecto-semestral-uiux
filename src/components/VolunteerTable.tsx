import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { VolunteerStatus } from "@/lib/types";

const STATUS_STYLES: Record<VolunteerStatus, string> = {
  asignado: "bg-status-assigned-bg text-status-assigned-foreground border-0",
  espera: "bg-status-waiting-bg text-status-waiting-foreground border-0",
  no_asignado: "bg-status-unassigned-bg text-status-unassigned-foreground border-0",
  cancelado: "bg-muted text-muted-foreground border-0",
};

const STATUS_LABELS: Record<VolunteerStatus, string> = {
  asignado: "Asignado",
  espera: "En Espera",
  no_asignado: "No Asignado",
  cancelado: "Cancelado",
};

export function VolunteerTable() {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");

  const zoneMap = useMemo(() => new Map(state.zones.map(z => [z.id, z.nombre])), [state.zones]);

  const filtered = useMemo(() => {
    return state.volunteers.filter(v => {
      if (statusFilter !== "all" && v.estado !== statusFilter) return false;
      if (zoneFilter !== "all" && v.zonaAsignadaId !== zoneFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return v.nombre.toLowerCase().includes(s) || v.correo.toLowerCase().includes(s) || v.universidad.toLowerCase().includes(s);
      }
      return true;
    });
  }, [state.volunteers, search, statusFilter, zoneFilter]);

  if (state.volunteers.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No hay voluntarios cargados. Sube un archivo Excel o CSV.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, correo o universidad..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="asignado">Asignado</SelectItem>
            <SelectItem value="espera">En Espera</SelectItem>
            <SelectItem value="no_asignado">No Asignado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Zona" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {state.zones.map(z => <SelectItem key={z.id} value={z.id}>{z.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">{filtered.length} voluntarios</div>

      <div className="rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Correo</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Sexo</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Universidad</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Zona Preferida</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Zona Asignada</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-t hover:bg-muted/50">
                <td className="p-3 font-medium">{v.nombre}</td>
                <td className="p-3 text-muted-foreground">{v.correo}</td>
                <td className="p-3">{v.sexo}</td>
                <td className="p-3">{v.universidad}</td>
                <td className="p-3">{v.zonaPreferida}</td>
                <td className="p-3">{v.zonaAsignadaId ? zoneMap.get(v.zonaAsignadaId) || "—" : "—"}</td>
                <td className="p-3">
                  <Badge className={STATUS_STYLES[v.estado]}>{STATUS_LABELS[v.estado]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
