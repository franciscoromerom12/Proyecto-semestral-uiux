'use client'

import { useCallback, useState } from 'react'
import { parseFileWithAtributos } from '@/lib/utils/file-parser'
import { Upload, FileSpreadsheet, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
}

export function FileUpload({ inscripcionId, atributos }: Props) {
  const [errors, setErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { importarVoluntarios } = useMockStore()

  const handleFile = useCallback(async (file: File) => {
    setErrors([])
    setIsUploading(true)

    const { rows, errors: parseErrors } = await parseFileWithAtributos(file, atributos)

    if (parseErrors.length > 0 && rows.length === 0) {
      setErrors(parseErrors)
      setIsUploading(false)
      return
    }

    const importados = importarVoluntarios(inscripcionId, rows)
    toast.success(`${importados} voluntarios importados correctamente`)
    setIsUploading(false)
  }, [inscripcionId, atributos, importarVoluntarios])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }, [handleFile])

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-2">Arrastra un archivo Excel o CSV aquí</p>
        <label>
          <Button variant="outline" asChild disabled={isUploading}>
            <span>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {isUploading ? 'Importando...' : 'Seleccionar archivo'}
            </span>
          </Button>
          <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={onFileInput} disabled={isUploading} />
        </label>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-destructive font-medium">
            <AlertTriangle className="h-4 w-4" />Errores encontrados
          </div>
          {errors.map((err, i) => <p key={`${i}-${err}`} className="text-sm text-destructive/80 pl-6">{err}</p>)}
        </div>
      )}

      {atributos.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Columnas esperadas:</p>
          <p>{atributos.map(a => a.nombre).join(', ')}</p>
        </div>
      )}
    </div>
  )
}
