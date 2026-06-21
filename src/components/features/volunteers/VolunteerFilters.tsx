'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import type { FiltrosVoluntarios, CategoriaFiltro } from '@/lib/utils/volunteer-filters'
import { CATEGORIA_FILTRO_LABELS } from '@/lib/utils/volunteer-filters'

interface Props {
  filtros: FiltrosVoluntarios
  zonas: ZonaEntity[]
  onChange: (filtros: FiltrosVoluntarios) => void
  showZona?: boolean
}

const CATEGORIAS: CategoriaFiltro[] = ['todos', 'hombres', 'mujeres', 'uc', 'no_uc', 'hombres_uc', 'mujeres_uc']

export function VolunteerFilters({ filtros, zonas, onChange, showZona = true }: Props) {
  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">Categoría:</span>
        {CATEGORIAS.map(cat => (
          <Button
            key={cat}
            type="button"
            size="sm"
            variant={filtros.categoria === cat ? 'default' : 'outline'}
            className="h-7 px-2.5 text-xs"
            onClick={() => onChange({ ...filtros, categoria: cat })}
          >
            {CATEGORIA_FILTRO_LABELS[cat]}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
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

        {showZona && (
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
                  <SelectItem key={z.id} value={z.id}>{z.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
