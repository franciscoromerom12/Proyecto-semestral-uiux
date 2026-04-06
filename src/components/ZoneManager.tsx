import { useState } from "react";
import { useStore } from "@/lib/store";
import { Zone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";

export function ZoneManager() {
  const { state, setZones } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", cupoTotal: "", minHombres: "", minMujeres: "", minPUC: "" });

  const resetForm = () => setForm({ nombre: "", cupoTotal: "", minHombres: "", minMujeres: "", minPUC: "" });

  const handleAdd = () => {
    if (!form.nombre.trim()) return toast.error("Nombre requerido");
    const zone: Zone = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      cupoTotal: Number(form.cupoTotal) || 0,
      minHombres: Number(form.minHombres) || 0,
      minMujeres: Number(form.minMujeres) || 0,
      minPUC: Number(form.minPUC) || 0,
    };
    setZones([...state.zones, zone]);
    resetForm();
    toast.success("Zona creada");
  };

  const handleDelete = (id: string) => {
    setZones(state.zones.filter(z => z.id !== id));
    toast.success("Zona eliminada");
  };

  const startEdit = (zone: Zone) => {
    setEditing(zone.id);
    setForm({
      nombre: zone.nombre,
      cupoTotal: String(zone.cupoTotal),
      minHombres: String(zone.minHombres),
      minMujeres: String(zone.minMujeres),
      minPUC: String(zone.minPUC),
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    setZones(state.zones.map(z => z.id === editing ? {
      ...z,
      nombre: form.nombre.trim(),
      cupoTotal: Number(form.cupoTotal) || 0,
      minHombres: Number(form.minHombres) || 0,
      minMujeres: Number(form.minMujeres) || 0,
      minPUC: Number(form.minPUC) || 0,
    } : z));
    setEditing(null);
    resetForm();
    toast.success("Zona actualizada");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-card-foreground">{editing ? "Editar Zona" : "Nueva Zona"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Zona Norte" />
          </div>
          <div>
            <Label>Cupo Total</Label>
            <Input type="number" value={form.cupoTotal} onChange={e => setForm(f => ({ ...f, cupoTotal: e.target.value }))} placeholder="0" />
          </div>
          <div>
            <Label>Mín. Hombres</Label>
            <Input type="number" value={form.minHombres} onChange={e => setForm(f => ({ ...f, minHombres: e.target.value }))} placeholder="0" />
          </div>
          <div>
            <Label>Mín. Mujeres</Label>
            <Input type="number" value={form.minMujeres} onChange={e => setForm(f => ({ ...f, minMujeres: e.target.value }))} placeholder="0" />
          </div>
          <div>
            <Label>Mín. PUC</Label>
            <Input type="number" value={form.minPUC} onChange={e => setForm(f => ({ ...f, minPUC: e.target.value }))} placeholder="0" />
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={saveEdit}><Check className="mr-1 h-4 w-4" />Guardar</Button>
              <Button variant="outline" onClick={() => { setEditing(null); resetForm(); }}><X className="mr-1 h-4 w-4" />Cancelar</Button>
            </>
          ) : (
            <Button onClick={handleAdd}><Plus className="mr-1 h-4 w-4" />Agregar Zona</Button>
          )}
        </div>
      </div>

      {state.zones.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Nombre</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Cupo</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Mín H</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Mín M</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Mín PUC</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {state.zones.map(zone => (
                <tr key={zone.id} className="border-t">
                  <td className="p-3 font-medium">{zone.nombre}</td>
                  <td className="p-3 text-center">{zone.cupoTotal}</td>
                  <td className="p-3 text-center">{zone.minHombres}</td>
                  <td className="p-3 text-center">{zone.minMujeres}</td>
                  <td className="p-3 text-center">{zone.minPUC}</td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(zone)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(zone.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
