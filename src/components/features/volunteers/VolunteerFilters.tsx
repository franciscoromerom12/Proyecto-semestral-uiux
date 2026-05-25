'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import type { FiltrosVoluntarios } from '@/lib/utils/volunteer-filters'

interface Props {
  filtros: FiltrosVoluntarios
  zonas: ZonaEntity[]
  onChange: (filtros: FiltrosVoluntarios) => void
}

export function VolunteerFilters({ filtros, zonas, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-2">
        <Switch
          id="puc-primero"
          checked={filtros.pucPrimero}
          onCheckedChange={checked => onChange({ ...filtros, pucPrimero: checked })}
        />
        <Label htmlFor="puc-primero" className="text-sm cursor-pointer">PUC primero</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="orden-inscripcion"
          checked={filtros.ordenInscripcion}
          onCheckedChange={checked => onChange({ ...filtros, ordenInscripcion: checked })}
        />
        <Label htmlFor="orden-inscripcion" className="text-sm cursor-pointer">Orden de inscripción</Label>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground whitespace-nowrap">Zona preferida:</Label>
        <Select
          value={filtros.zonaId ?? 'todas'}
          onValueChange={value => onChange({ ...filtros, zonaId: value === 'todas' ? null : value })}
        >
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {zonas.map(z => (
              <SelectItem key={z.id} value={z.id}>
                {z.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
