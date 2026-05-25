'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMockStore } from '@/components/providers/MockStoreProvider'
import { exportarResultadosExcel } from '@/lib/utils/file-parser'

interface Props {
  inscripcionId: string
}

export function ExportButton({ inscripcionId }: Props) {
  const { voluntarios: volsMap, zonas: zonasMap, atributos: attrsMap } = useMockStore()

  function handleExport() {
    const vols = volsMap[inscripcionId] ?? []
    const zonas = zonasMap[inscripcionId] ?? []
    const atributos = attrsMap[inscripcionId] ?? []
    if (vols.length === 0) {
      toast.error('No hay voluntarios para exportar')
      return
    }
    exportarResultadosExcel(vols, zonas, atributos)
    toast.success('Archivo exportado correctamente')
  }

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Exportar Excel
    </Button>
  )
}
