'use client'

import { useCallback, useMemo, useState } from 'react'
import { Upload, FileSpreadsheet, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { parseFileWithAtributos } from '@/lib/utils/file-parser'
import { construirMapaColumnas, esHombre } from '@/lib/domain/asignacion/algorithm'
import {
  categoriaDeVoluntario,
  campoCategoria,
  calcularOcupacionPorZona,
  recomendarZonaEquilibrio,
  CATEGORIA_LABELS,
  CONTEO_VACIO,
  type CategoriaVoluntario,
  type ConteoCategoria,
} from '@/lib/domain/asignacion/algorithm-meta'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
  atributos: AtributoEntity[]
}

function normalizarValor(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

function detectarColumnasNombre(atributos: AtributoEntity[]): string[] {
  return atributos
    .filter(a => {
      const n = normalizarValor(a.nombre)
      return n === 'nombre' || /^nombre\s*(y\s*apellido|completo)/.test(n)
    })
    .map(a => a.nombre)
}

function detectarColumnasSexo(atributos: AtributoEntity[]): string[] {
  return atributos.filter(a => normalizarValor(a.nombre) === 'sexo').map(a => a.nombre)
}

function detectarColumnasEdad(atributos: AtributoEntity[]): string[] {
  return atributos.filter(a => normalizarValor(a.nombre).startsWith('edad')).map(a => a.nombre)
}

interface PerfilVoluntario {
  tokens: string[]
  esHombre: boolean | null
  edad: number | null
}

function construirPerfil(datos: Record<string, string>, colsNombre: string[], colsSexo: string[], colsEdad: string[]): PerfilVoluntario {
  const tokens = new Set<string>()
  for (const c of colsNombre) {
    for (const w of normalizarValor(datos[c] ?? '').split(' ')) {
      if (w.length > 1) tokens.add(w)
    }
  }
  let sexoRaw = ''
  for (const c of colsSexo) {
    if ((datos[c] ?? '').trim()) { sexoRaw = datos[c]; break }
  }
  let edad: number | null = null
  for (const c of colsEdad) {
    const n = parseInt(datos[c] ?? '', 10)
    if (!isNaN(n)) { edad = n; break }
  }
  return { tokens: [...tokens], esHombre: sexoRaw ? esHombre(sexoRaw) : null, edad }
}

function mismoVoluntario(a: PerfilVoluntario, b: PerfilVoluntario): boolean {
  if (a.esHombre !== null && b.esHombre !== null && a.esHombre !== b.esHombre) return false
  if (a.edad !== null && b.edad !== null && a.edad !== b.edad) return false
  if (a.tokens.length === 0 || b.tokens.length === 0) return false
  const comunes = a.tokens.filter(t => b.tokens.includes(t)).length
  const minRequerido = Math.min(2, Math.min(a.tokens.length, b.tokens.length))
  return comunes >= minRequerido
}

interface NuevoVoluntario {
  id: number
  datos: Record<string, string>
  nombre: string
  categoria: CategoriaVoluntario
}

type FiltroCategoria = 'todos' | CategoriaVoluntario

export function CorrerListaEspera({ inscripcionId, atributos }: Props) {
  const { voluntarios: volsMap, zonas: zonasMap, agregarVoluntarioConDestino } = useMockStore()
  const existentes = volsMap[inscripcionId] ?? []
  const zonas: ZonaEntity[] = zonasMap[inscripcionId] ?? []

  const mapa = useMemo(() => construirMapaColumnas(atributos), [atributos])
  const colSexo = mapa.sexo
  const colUniversidad = mapa.universidad
  const colNombre = mapa.nombre_completo ?? atributos[0]?.nombre

  // Ocupación local (se actualiza al asignar para reflejar cupos en vivo).
  const [ocupacion, setOcupacion] = useState<Record<string, ConteoCategoria>>(
    () => calcularOcupacionPorZona(existentes, colSexo, colUniversidad),
  )

  const [nuevos, setNuevos] = useState<NuevoVoluntario[]>([])
  const [zonaSeleccionada, setZonaSeleccionada] = useState<Record<number, string>>({})
  const [procesando, setProcesando] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<FiltroCategoria>('todos')
  const [errors, setErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [modo, setModo] = useState<'bd' | 'dos_excel'>('dos_excel')
  const [rowsAnterior, setRowsAnterior] = useState<Record<string, string>[] | null>(null)
  const [rowsActual, setRowsActual] = useState<Record<string, string>[] | null>(null)
  const [nombreAnterior, setNombreAnterior] = useState('')
  const [nombreActual, setNombreActual] = useState('')

  const detectarNuevos = useCallback((
    baseline: Record<string, string>[],
    candidatos: Record<string, string>[],
  ): { nuevos: NuevoVoluntario[]; error?: string } => {
    const colsNombre = detectarColumnasNombre(atributos)
    const colsSexo = detectarColumnasSexo(atributos)
    const colsEdad = detectarColumnasEdad(atributos)

    if (colsNombre.length === 0) {
      return { nuevos: [], error: 'No se pudo identificar la columna de nombre para comparar. Revisa que el Excel tenga una columna de nombre.' }
    }

    const perfilesBase = baseline.map(d => construirPerfil(d, colsNombre, colsSexo, colsEdad))
    const perfilesNuevos: PerfilVoluntario[] = []
    const nuevos: NuevoVoluntario[] = []
    let id = 0

    for (const datos of candidatos) {
      const tieneAlgo = atributos.some(a => (datos[a.nombre] ?? '').trim() !== '')
      if (!tieneAlgo) continue

      const perfil = construirPerfil(datos, colsNombre, colsSexo, colsEdad)
      if (perfil.tokens.length === 0) continue

      const duplicado =
        perfilesBase.some(p => mismoVoluntario(perfil, p)) ||
        perfilesNuevos.some(p => mismoVoluntario(perfil, p))
      if (duplicado) continue
      perfilesNuevos.push(perfil)

      const nombre = colNombre ? (datos[colNombre] ?? '') : ''
      nuevos.push({
        id: id++,
        datos,
        nombre: nombre || '(sin nombre)',
        categoria: categoriaDeVoluntario(datos, colSexo, colUniversidad),
      })
    }
    return { nuevos }
  }, [atributos, colNombre, colSexo, colUniversidad])

  // Modo BD: un Excel comparado contra los voluntarios existentes.
  const handleFile = useCallback(async (file: File) => {
    setErrors([])
    setIsUploading(true)
    try {
      const { rows, errors: parseErrors } = await parseFileWithAtributos(file, atributos)
      if (parseErrors.length > 0 && rows.length === 0) { setErrors(parseErrors); return }

      const { nuevos, error } = detectarNuevos(existentes.map(v => v.datos), rows)
      if (error) { setErrors([error]); return }

      setNuevos(nuevos)
      setZonaSeleccionada({})
      if (nuevos.length === 0) toast.info('No se detectaron voluntarios nuevos en el archivo')
      else toast.success(`${nuevos.length} voluntarios nuevos detectados`)
    } catch {
      setErrors(['Error al procesar el archivo'])
    } finally {
      setIsUploading(false)
    }
  }, [atributos, existentes, detectarNuevos])

  // Modo dos Excel: muestra los del Excel actual que no están en el anterior.
  const handleArchivoComparacion = useCallback(async (file: File, cual: 'anterior' | 'actual') => {
    setErrors([])
    setIsUploading(true)
    try {
      const { rows, errors: parseErrors } = await parseFileWithAtributos(file, atributos)
      if (parseErrors.length > 0 && rows.length === 0) { setErrors(parseErrors); return }

      const anterior = cual === 'anterior' ? rows : rowsAnterior
      const actual = cual === 'actual' ? rows : rowsActual

      if (cual === 'anterior') { setRowsAnterior(rows); setNombreAnterior(file.name) }
      else { setRowsActual(rows); setNombreActual(file.name) }

      if (anterior && actual) {
        const { nuevos, error } = detectarNuevos(anterior, actual)
        if (error) { setErrors([error]); return }
        setNuevos(nuevos)
        setZonaSeleccionada({})
        if (nuevos.length === 0) toast.info('No hay voluntarios en el Excel actual que no estén en el anterior')
        else toast.success(`${nuevos.length} voluntarios nuevos detectados`)
      }
    } catch {
      setErrors(['Error al procesar el archivo'])
    } finally {
      setIsUploading(false)
    }
  }, [atributos, rowsAnterior, rowsActual, detectarNuevos])

  function cambiarModo(nuevoModo: 'bd' | 'dos_excel') {
    setModo(nuevoModo)
    setNuevos([]); setZonaSeleccionada({}); setErrors([])
    setRowsAnterior(null); setRowsActual(null); setNombreAnterior(''); setNombreActual('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }, [handleFile])

  function cupoLibre(zona: ZonaEntity): number {
    const o = ocupacion[zona.id] ?? CONTEO_VACIO
    return zona.cupoTotal - (o.hombrePUC + o.hombreNoPUC + o.mujerPUC + o.mujerNoPUC)
  }

  function recomendacion(v: NuevoVoluntario) {
    return recomendarZonaEquilibrio(v.categoria, zonas, ocupacion)
  }

  function asignar(v: NuevoVoluntario, zonaId: string) {
    const zona = zonas.find(z => z.id === zonaId)
    if (!zona) return
    if (cupoLibre(zona) <= 0) { toast.error('La zona no tiene cupo disponible'); return }
    setProcesando(v.id)
    setTimeout(() => {
      agregarVoluntarioConDestino(inscripcionId, v.datos, 'asignado', zonaId)
      setOcupacion(prev => {
        const actual = prev[zonaId] ?? { ...CONTEO_VACIO }
        const campo = campoCategoria(v.categoria)
        return { ...prev, [zonaId]: { ...actual, [campo]: actual[campo] + 1 } }
      })
      setNuevos(prev => prev.filter(n => n.id !== v.id))
      setProcesando(null)
      toast.success(`Asignado a ${zona.nombre}`)
    }, 250)
  }

  function aListaEspera(v: NuevoVoluntario) {
    setProcesando(v.id)
    setTimeout(() => {
      agregarVoluntarioConDestino(inscripcionId, v.datos, 'lista_espera', null)
      setNuevos(prev => prev.filter(n => n.id !== v.id))
      setProcesando(null)
      toast.success('Enviado a lista de espera')
    }, 250)
  }

  const filtrados = useMemo(
    () => filtro === 'todos' ? nuevos : nuevos.filter(n => n.categoria === filtro),
    [nuevos, filtro],
  )

  const conteos = useMemo(() => {
    const c: Record<FiltroCategoria, number> = { todos: nuevos.length, hombre_puc: 0, hombre_no_puc: 0, mujer_puc: 0, mujer_no_puc: 0 }
    for (const n of nuevos) c[n.categoria]++
    return c
  }, [nuevos])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={modo === 'dos_excel' ? 'default' : 'outline'} size="sm" onClick={() => cambiarModo('dos_excel')}>
          Comparar dos Excel
        </Button>
        <Button variant={modo === 'bd' ? 'default' : 'outline'} size="sm" onClick={() => cambiarModo('bd')}>
          Comparar con los voluntarios actuales
        </Button>
      </div>

      {modo === 'bd' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <Upload className="mx-auto h-9 w-9 text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-2 text-sm">
            Sube el Excel nuevo. Se compara contra los voluntarios ya cargados (por nombre, edad y sexo) y se muestran solo los nuevos.
          </p>
          <label>
            <Button variant="outline" asChild disabled={isUploading}>
              <span>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {isUploading ? 'Procesando...' : 'Seleccionar archivo'}
              </span>
            </Button>
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={onFileInput} disabled={isUploading} />
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Sube los dos Excel. Se muestran las personas del <strong>Excel actual</strong> que no están en el <strong>Excel anterior</strong> (comparando por nombre, edad y sexo).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ExcelBox titulo="Excel anterior" nombreArchivo={nombreAnterior} disabled={isUploading} onSelect={(file) => handleArchivoComparacion(file, 'anterior')} />
            <ExcelBox titulo="Excel actual" nombreArchivo={nombreActual} disabled={isUploading} onSelect={(file) => handleArchivoComparacion(file, 'actual')} />
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-destructive font-medium">
            <AlertTriangle className="h-4 w-4" />Errores encontrados
          </div>
          {errors.map((err, i) => <p key={`${i}-${err}`} className="text-sm text-destructive/80 pl-6">{err}</p>)}
        </div>
      )}

      {nuevos.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {(['todos', 'hombre_puc', 'hombre_no_puc', 'mujer_puc', 'mujer_no_puc'] as FiltroCategoria[]).map(f => (
              <Button key={f} variant={filtro === f ? 'default' : 'outline'} size="sm" onClick={() => setFiltro(f)}>
                {f === 'todos' ? 'Todos' : CATEGORIA_LABELS[f]}
                <Badge variant="secondary" className="ml-2">{conteos[f]}</Badge>
              </Button>
            ))}
          </div>

          <div className="rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Voluntario</th>
                  <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Categoría</th>
                  <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Recomendación</th>
                  <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Zona</th>
                  <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(v => {
                  const rec = recomendacion(v)
                  const seleccion = zonaSeleccionada[v.id] ?? rec?.zonaId ?? ''
                  const ocupado = procesando === v.id
                  return (
                    <tr key={v.id} className="border-t">
                      <td className="p-3 font-medium max-w-[220px]"><span className="block truncate">{v.nombre}</span></td>
                      <td className="p-3"><Badge variant="outline">{CATEGORIA_LABELS[v.categoria]}</Badge></td>
                      <td className="p-3 text-muted-foreground">
                        {rec ? rec.nombre : <span className="text-amber-600">Sin cupo</span>}
                      </td>
                      <td className="p-3">
                        <Select value={seleccion} onValueChange={val => setZonaSeleccionada(prev => ({ ...prev, [v.id]: val }))}>
                          <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="Elegir zona" /></SelectTrigger>
                          <SelectContent>
                            {zonas.map(z => {
                              const libre = cupoLibre(z)
                              return (
                                <SelectItem key={z.id} value={z.id} disabled={libre <= 0}>
                                  {z.nombre} ({libre} libres)
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" disabled={ocupado || !seleccion} onClick={() => asignar(v, seleccion)}>
                            {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Asignar'}
                          </Button>
                          <Button size="sm" variant="outline" disabled={ocupado} onClick={() => aListaEspera(v)}>
                            Lista de espera
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

interface ExcelBoxProps {
  titulo: string
  nombreArchivo: string
  disabled: boolean
  onSelect: (file: File) => void
}

function ExcelBox({ titulo, nombreArchivo, disabled, onSelect }: ExcelBoxProps) {
  return (
    <div className="border-2 border-dashed rounded-lg p-6 text-center border-border">
      <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
      <p className="font-medium text-sm mb-1">{titulo}</p>
      {nombreArchivo
        ? <p className="text-xs text-muted-foreground mb-3 truncate">{nombreArchivo}</p>
        : <p className="text-xs text-muted-foreground mb-3">Ningún archivo seleccionado</p>}
      <label>
        <Button variant="outline" size="sm" asChild disabled={disabled}>
          <span>{nombreArchivo ? 'Cambiar archivo' : 'Seleccionar archivo'}</span>
        </Button>
        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" disabled={disabled}
          onChange={(e) => { const file = e.target.files?.[0]; if (file) onSelect(file); e.target.value = '' }} />
      </label>
    </div>
  )
}
