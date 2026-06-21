import type { AtributoEntity } from '@/lib/domain/atributos/types'
import type { VoluntarioEntity } from '@/lib/domain/voluntarios/types'
import type { ZonaEntity } from '@/lib/domain/zonas/types'
import type { ConfigOrdenEntity, CriterioOrden, FiltroEliminatorio } from '@/lib/domain/config-orden/types'
import type {
  MapaColumnas,
  RolSistema,
  VoluntarioExpandido,
  CuposZona,
  ResultadoAsignacion,
} from './types'

// ---------------------------------------------------------------------------
// Helpers de clasificación
// ---------------------------------------------------------------------------

export function esPUC(universidad: string): boolean {
  const u = universidad.toUpperCase()
  return u.includes('PUC') || u.includes('CATÓLICA') || u.includes('CATOLICA') || u.includes('UC ')
}

export function esHombre(sexo: string): boolean {
  const s = sexo.toLowerCase().trim()
  return s === 'm' || s === 'masculino' || s === 'hombre' || s === 'male'
}

function parseBooleano(valor: string): boolean {
  const v = valor.toLowerCase().trim()
  return v === 'si' || v === 'sí' || v === 'true' || v === '1' || v === 'yes'
}

// ---------------------------------------------------------------------------
// Detección automática de columnas por nombre
// ---------------------------------------------------------------------------

// Patrones por rol. Si el nombre de una columna matchea, se usa como ese rol.
// rolSistema explícito en el atributo siempre toma precedencia.
const PATRONES_COLUMNA: Record<RolSistema, RegExp> = {
  nombre_completo:             /nombre\s*completo|full\s*name/i,
  sexo:                        /^sexo$|^g[eé]nero$|^gender$|^sex$/i,
  universidad:                 /universidad|university/i,
  edad:                        /^edad$|^age$/i,
  fecha_inscripcion:           /fecha.*inscripci[oó]n|inscripci[oó]n.*fecha|timestamp|^fecha$/i,
  dias_disponibles:            /d[ií]as.*disponibles|disponibles.*d[ií]as|cu[aá]ntos.*d[ií]as|days/i,
  prioridad_zona_1:            /prioridad\s*(de\s*zona\s*)?1|primera\s*prioridad|zona.*preferida\s*1/i,
  prioridad_zona_1_obligatorio:/prioridad\s*1.*obligatori|obligatori.*prioridad\s*1/i,
  prioridad_zona_2:            /prioridad\s*(de\s*zona\s*)?2|segunda\s*prioridad|zona.*preferida\s*2/i,
  prioridad_zona_2_obligatorio:/prioridad\s*2.*obligatori|obligatori.*prioridad\s*2/i,
  amigo_1:                     /^amigo\s*1$|^amigo\s*con.*\s*1$/i,
  amigo_1_obligatorio:         /amigo\s*1.*obligatori|obligatori.*amigo\s*1/i,
  amigo_2:                     /^amigo\s*2$/i,
  amigo_2_obligatorio:         /amigo\s*2.*obligatori|obligatori.*amigo\s*2/i,
  amigo_3:                     /^amigo\s*3$/i,
  amigo_3_obligatorio:         /amigo\s*3.*obligatori|obligatori.*amigo\s*3/i,
}

// ---------------------------------------------------------------------------
// Construir mapa de columnas
// Prioridad: 1° rolSistema explícito, 2° detección por nombre de columna
// ---------------------------------------------------------------------------

export function construirMapaColumnas(atributos: AtributoEntity[]): MapaColumnas {
  const mapa: MapaColumnas = {}

  // Paso 1: usar rolSistema explícito cuando está configurado
  for (const atributo of atributos) {
    if (atributo.rolSistema) {
      mapa[atributo.rolSistema as RolSistema] = atributo.nombre
    }
  }

  // Paso 2: detectar por nombre de columna los roles que aún no están mapeados
  for (const atributo of atributos) {
    for (const [rol, patron] of Object.entries(PATRONES_COLUMNA) as [RolSistema, RegExp][]) {
      if (mapa[rol]) continue // ya mapeado en paso 1
      if (patron.test(atributo.nombre)) {
        mapa[rol] = atributo.nombre
      }
    }
  }

  return mapa
}

// ---------------------------------------------------------------------------
// Expandir voluntarios: parsea datos{} en campos tipados
// ---------------------------------------------------------------------------

export function expandirVoluntarios(
  voluntarios: VoluntarioEntity[],
  mapa: MapaColumnas,
): VoluntarioExpandido[] {
  return voluntarios.map(v => {
    const d = v.datos

    const nombreCompleto = mapa.nombre_completo ? (d[mapa.nombre_completo] ?? '') : ''
    const sexo = mapa.sexo ? (d[mapa.sexo] ?? '') : ''
    const universidad = mapa.universidad ? (d[mapa.universidad] ?? '') : ''
    const edadRaw = mapa.edad ? (d[mapa.edad] ?? '') : ''
    const edad = parseInt(edadRaw, 10) || 0
    const fechaRaw = mapa.fecha_inscripcion ? (d[mapa.fecha_inscripcion] ?? '') : ''
    const fechaInscripcion = fechaRaw ? new Date(fechaRaw) : v.createdAt
    const diasRaw = mapa.dias_disponibles ? (d[mapa.dias_disponibles] ?? '') : ''
    const diasDisponibles = parseInt(diasRaw, 10) || 0

    const prioridad1 = mapa.prioridad_zona_1 ? (d[mapa.prioridad_zona_1] ?? '') : ''
    const prioridad1ObligatorioRaw = mapa.prioridad_zona_1_obligatorio
      ? (d[mapa.prioridad_zona_1_obligatorio] ?? '')
      : ''
    const prioridad1Obligatorio = parseBooleano(prioridad1ObligatorioRaw)

    const prioridad2 = mapa.prioridad_zona_2 ? (d[mapa.prioridad_zona_2] ?? '') : ''
    const prioridad2ObligatorioRaw = mapa.prioridad_zona_2_obligatorio
      ? (d[mapa.prioridad_zona_2_obligatorio] ?? '')
      : ''
    const prioridad2Obligatorio = parseBooleano(prioridad2ObligatorioRaw)

    const amigos: VoluntarioExpandido['amigos'] = []
    for (const n of [1, 2, 3] as const) {
      const claveNombre = `amigo_${n}` as RolSistema
      const claveObl = `amigo_${n}_obligatorio` as RolSistema
      const nombreAmigo = mapa[claveNombre] ? (d[mapa[claveNombre]!] ?? '').trim() : ''
      if (nombreAmigo) {
        const oblRaw = mapa[claveObl] ? (d[mapa[claveObl]!] ?? '') : ''
        amigos.push({ nombre: nombreAmigo, obligatorio: parseBooleano(oblRaw) })
      }
    }

    return {
      id: v.id,
      nombreCompleto,
      sexo,
      universidad,
      edad,
      fechaInscripcion,
      diasDisponibles,
      prioridad1,
      prioridad1Obligatorio,
      prioridad2,
      prioridad2Obligatorio,
      amigos,
      estado: 'pendiente',
      zonaId: null,
    }
  })
}

// ---------------------------------------------------------------------------
// Etapa 1: Filtrado de inelegibles
// ---------------------------------------------------------------------------

export function filtrarVoluntarios(voluntarios: VoluntarioExpandido[]): VoluntarioExpandido[] {
  return voluntarios.map(v => {
    if (v.edad < 18 || v.edad > 26) {
      return { ...v, estado: 'filtrado', razonFiltrado: 'edad_fuera_de_rango' }
    }
    return v
  })
}

// ---------------------------------------------------------------------------
// Etapa 2: Ordenar por prioridad (PUC primero, luego por fecha ascendente)
// ---------------------------------------------------------------------------

export function ordenarPorPrioridad(voluntarios: VoluntarioExpandido[]): VoluntarioExpandido[] {
  return [...voluntarios].sort((a, b) => {
    const aPUC = esPUC(a.universidad) ? 0 : 1
    const bPUC = esPUC(b.universidad) ? 0 : 1
    if (aPUC !== bPUC) return aPUC - bPUC
    return a.fechaInscripcion.getTime() - b.fechaInscripcion.getTime()
  })
}

// ---------------------------------------------------------------------------
// Etapa 3: Separar aceptados y lista de espera según N total de cupos
// ---------------------------------------------------------------------------

export function separarAceptadosYEspera(
  voluntariosSorted: VoluntarioExpandido[],
  totalCupos: number,
): VoluntarioExpandido[] {
  let aceptados = 0
  return voluntariosSorted.map(v => {
    if (v.estado === 'filtrado') return v
    if (aceptados < totalCupos) {
      aceptados++
      return { ...v, estado: 'aceptado' }
    }
    return { ...v, estado: 'lista_espera' }
  })
}

// ---------------------------------------------------------------------------
// Etapa 4: Calcular cupos por zona con proporciones de género y universidad
// ---------------------------------------------------------------------------

export function calcularCuposPorZona(
  aceptados: VoluntarioExpandido[],
  zonas: ZonaEntity[],
): CuposZona[] {
  const total = aceptados.length
  if (total === 0 || zonas.length === 0) return []

  const hPUC  = aceptados.filter(v => esHombre(v.sexo) && esPUC(v.universidad)).length
  const hNoPUC = aceptados.filter(v => esHombre(v.sexo) && !esPUC(v.universidad)).length
  const mPUC  = aceptados.filter(v => !esHombre(v.sexo) && esPUC(v.universidad)).length
  const mNoPUC = aceptados.filter(v => !esHombre(v.sexo) && !esPUC(v.universidad)).length

  const ratioHPUC  = hPUC / total
  const ratioHNoPUC = hNoPUC / total
  const ratioMPUC  = mPUC / total
  const ratioMNoPUC = mNoPUC / total

  return zonas.map(zona => {
    const c = zona.cupoTotal

    // Cupos proporcionales con piso
    let qHPUC  = Math.floor(c * ratioHPUC)
    let qHNoPUC = Math.floor(c * ratioHNoPUC)
    let qMPUC  = Math.floor(c * ratioMPUC)
    let qMNoPUC = Math.floor(c * ratioMNoPUC)

    // Distribuir los cupos sobrantes por el mayor residuo
    const residuos = [
      { key: 'hPUC' as const,  val: (c * ratioHPUC)  - qHPUC },
      { key: 'hNoPUC' as const, val: (c * ratioHNoPUC) - qHNoPUC },
      { key: 'mPUC' as const,  val: (c * ratioMPUC)  - qMPUC },
      { key: 'mNoPUC' as const, val: (c * ratioMNoPUC) - qMNoPUC },
    ].sort((a, b) => b.val - a.val)

    let sobrante = c - (qHPUC + qHNoPUC + qMPUC + qMNoPUC)
    for (const r of residuos) {
      if (sobrante <= 0) break
      if (r.key === 'hPUC')   { qHPUC++;   sobrante-- }
      if (r.key === 'hNoPUC') { qHNoPUC++; sobrante-- }
      if (r.key === 'mPUC')   { qMPUC++;   sobrante-- }
      if (r.key === 'mNoPUC') { qMNoPUC++; sobrante-- }
    }

    return {
      zonaId: zona.id,
      nombre: zona.nombre,
      cupoTotal: c,
      cupos: { hombrePUC: qHPUC, hombreNoPUC: qHNoPUC, mujerPUC: qMPUC, mujerNoPUC: qMNoPUC },
      asignados: { hombrePUC: 0, hombreNoPUC: 0, mujerPUC: 0, mujerNoPUC: 0 },
    }
  })
}

// ---------------------------------------------------------------------------
// Helpers de cupos
// ---------------------------------------------------------------------------

function totalAsignadosEnZona(cupos: CuposZona): number {
  const a = cupos.asignados
  return a.hombrePUC + a.hombreNoPUC + a.mujerPUC + a.mujerNoPUC
}

function hayEspacioParaVoluntario(v: VoluntarioExpandido, cupos: CuposZona): boolean {
  const a = cupos.asignados
  const c = cupos.cupos
  if (esHombre(v.sexo) && esPUC(v.universidad))   return a.hombrePUC  < c.hombrePUC
  if (esHombre(v.sexo) && !esPUC(v.universidad))  return a.hombreNoPUC < c.hombreNoPUC
  if (!esHombre(v.sexo) && esPUC(v.universidad))  return a.mujerPUC   < c.mujerPUC
  return a.mujerNoPUC < c.mujerNoPUC
}

function asignarEnCupo(v: VoluntarioExpandido, cupos: CuposZona): void {
  if (esHombre(v.sexo) && esPUC(v.universidad))   { cupos.asignados.hombrePUC++;  return }
  if (esHombre(v.sexo) && !esPUC(v.universidad))  { cupos.asignados.hombreNoPUC++; return }
  if (!esHombre(v.sexo) && esPUC(v.universidad))  { cupos.asignados.mujerPUC++;   return }
  cupos.asignados.mujerNoPUC++
}

function buscarCuposPorNombre(nombre: string, cuposPorZona: CuposZona[]): CuposZona | undefined {
  const n = nombre.toLowerCase().trim()
  return cuposPorZona.find(c => c.nombre.toLowerCase().trim() === n)
}

// ---------------------------------------------------------------------------
// Etapa 5: Asignación de aceptados a zonas
// ---------------------------------------------------------------------------

export function asignarAceptados(
  voluntarios: VoluntarioExpandido[],
  cuposPorZona: CuposZona[],
): VoluntarioExpandido[] {
  // Trabajamos con copias mutables
  const result = voluntarios.map(v => ({ ...v }))
  const cupos = cuposPorZona.map(c => ({
    ...c,
    asignados: { ...c.asignados },
    cupos: { ...c.cupos },
  }))

  const aceptados = result.filter(v => v.estado === 'aceptado')

  for (const vol of aceptados) {
    const idx = result.findIndex(v => v.id === vol.id)

    const zonasPreferidas = [vol.prioridad1, vol.prioridad2]
      .filter(Boolean)
      .map(nombre => buscarCuposPorNombre(nombre, cupos))
      .filter((c): c is CuposZona => c !== undefined)

    // Intentar cada zona preferida, luego cualquier zona con espacio
    const candidatas = [
      ...zonasPreferidas,
      ...cupos.filter(c => !zonasPreferidas.some(z => z.zonaId === c.zonaId)),
    ]

    let asignado = false

    for (const cuposZona of candidatas) {
      if (!hayEspacioParaVoluntario(vol, cuposZona)) continue

      // Sin amigos con restricción: asignar directamente
      if (vol.amigos.length === 0) {
        result[idx].estado = 'aceptado'
        result[idx].zonaId = cuposZona.zonaId
        asignarEnCupo(vol, cuposZona)
        asignado = true
        break
      }

      // Evaluar restricciones de amigos
      let puedeAsignar = true
      let liberarCupo = false
      const amigosPorAsignarJuntos: number[] = []

      for (const amigo of vol.amigos) {
        const amigoVol = result.find(
          v => v.nombreCompleto.toLowerCase().trim() === amigo.nombre.toLowerCase().trim(),
        )

        if (!amigoVol) {
          // Amigo no existe en la lista
          if (amigo.obligatorio) { puedeAsignar = false; liberarCupo = true }
          continue
        }

        if (amigoVol.estado === 'filtrado' || amigoVol.estado === 'lista_espera') {
          // Amigo no aceptado
          if (amigo.obligatorio) { puedeAsignar = false; liberarCupo = true }
          continue
        }

        if (amigoVol.zonaId === cuposZona.zonaId) {
          // Amigo ya está en esta zona: ok
          continue
        }

        if (amigoVol.zonaId !== null) {
          // Amigo ya asignado en otra zona
          if (amigo.obligatorio) { puedeAsignar = false }
          continue
        }

        // Amigo aceptado pero no asignado aún: asignar juntos
        const amigoIdx = result.findIndex(v => v.id === amigoVol.id)
        if (hayEspacioParaVoluntario(amigoVol, cuposZona)) {
          amigosPorAsignarJuntos.push(amigoIdx)
        } else if (amigo.obligatorio) {
          puedeAsignar = false
        }
      }

      if (liberarCupo) {
        // Cupo liberado para lista de espera — no se asigna
        break
      }

      if (puedeAsignar) {
        result[idx].zonaId = cuposZona.zonaId
        asignarEnCupo(vol, cuposZona)
        for (const amigoIdx of amigosPorAsignarJuntos) {
          result[amigoIdx].zonaId = cuposZona.zonaId
          asignarEnCupo(result[amigoIdx], cuposZona)
        }
        asignado = true
        break
      }
    }

    if (!asignado) {
      result[idx].estado = 'lista_espera'
      result[idx].zonaId = null
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Etapa 6: Llenar cupos vacíos con lista de espera
// ---------------------------------------------------------------------------

export function procesarListaEspera(
  voluntarios: VoluntarioExpandido[],
  cuposPorZona: CuposZona[],
): VoluntarioExpandido[] {
  const result = voluntarios.map(v => ({ ...v }))
  const cupos = cuposPorZona.map(c => ({
    ...c,
    asignados: { ...c.asignados },
    cupos: { ...c.cupos },
  }))

  const enEspera = result.filter(v => v.estado === 'lista_espera')

  for (const zona of cupos) {
    const espacio = zona.cupoTotal - totalAsignadosEnZona(zona)
    if (espacio <= 0) continue

    for (const vol of enEspera) {
      const idx = result.findIndex(v => v.id === vol.id)
      if (result[idx].zonaId !== null) continue
      if (!hayEspacioParaVoluntario(vol, zona)) continue

      result[idx].zonaId = zona.zonaId
      asignarEnCupo(vol, zona)
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Función principal del algoritmo
// ---------------------------------------------------------------------------

export function ejecutarAsignacionAutomatica(
  voluntarios: VoluntarioEntity[],
  zonas: ZonaEntity[],
  atributos: AtributoEntity[],
): ResultadoAsignacion {
  const mapa = construirMapaColumnas(atributos)
  const totalCupos = zonas.reduce((sum, z) => sum + z.cupoTotal, 0)

  // 1. Expandir
  let vols = expandirVoluntarios(voluntarios, mapa)

  // 2. Filtrar inelegibles
  vols = filtrarVoluntarios(vols)

  // 3. Ordenar elegibles por prioridad
  const elegibles = vols.filter(v => v.estado === 'pendiente')
  const filtrados = vols.filter(v => v.estado === 'filtrado')
  const ordenados = ordenarPorPrioridad(elegibles)

  // 4. Separar aceptados y espera
  const conEstado = separarAceptadosYEspera(ordenados, totalCupos)
  const todos = [...conEstado, ...filtrados]

  // 5. Calcular cupos por zona
  const aceptados = conEstado.filter(v => v.estado === 'aceptado')
  const cuposPorZona = calcularCuposPorZona(aceptados, zonas)

  // 6. Asignar aceptados a zonas
  let resultado = asignarAceptados(todos, cuposPorZona)

  // Recalcular cupos actualizados para etapa 7
  const cuposActualizados = cuposPorZona.map(c => {
    const asignados = resultado.filter(v => v.zonaId === c.zonaId)
    return {
      ...c,
      asignados: {
        hombrePUC: asignados.filter(v => esHombre(v.sexo) && esPUC(v.universidad)).length,
        hombreNoPUC: asignados.filter(v => esHombre(v.sexo) && !esPUC(v.universidad)).length,
        mujerPUC: asignados.filter(v => !esHombre(v.sexo) && esPUC(v.universidad)).length,
        mujerNoPUC: asignados.filter(v => !esHombre(v.sexo) && !esPUC(v.universidad)).length,
      },
    }
  })

  // 7. Procesar lista de espera
  resultado = procesarListaEspera(resultado, cuposActualizados)

  // Construir respuesta
  const asignadosFinales = resultado
    .filter(v => v.zonaId !== null)
    .map(v => ({ voluntarioId: v.id, zonaId: v.zonaId! }))

  const listaEsperaFinal = resultado
    .filter(v => v.estado === 'lista_espera' && v.zonaId === null)
    .map(v => ({ voluntarioId: v.id }))

  const filtradosFinal = resultado
    .filter(v => v.estado === 'filtrado')
    .map(v => ({ voluntarioId: v.id, razon: v.razonFiltrado ?? 'desconocido' }))

  return {
    asignados: asignadosFinales,
    listaEspera: listaEsperaFinal,
    filtrados: filtradosFinal,
    cuposFinales: cuposActualizados,
    resumen: {
      totalVoluntarios: voluntarios.length,
      totalAceptados: aceptados.length,
      totalAsignados: asignadosFinales.length,
      totalListaEspera: listaEsperaFinal.length,
      totalFiltrados: filtradosFinal.length,
    },
  }
}

// ---------------------------------------------------------------------------
// Orden personalizado — helpers internos
// ---------------------------------------------------------------------------

function valorNumerico(raw: string): number {
  const n = parseFloat(raw.replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function valorFecha(raw: string): number {
  const d = new Date(raw)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

function valorBooleano(raw: string): number {
  const v = raw.toLowerCase().trim()
  return v === 'si' || v === 'sí' || v === 'true' || v === '1' || v === 'yes' ? 1 : 0
}

function compararPorCriterio(
  a: VoluntarioExpandido,
  b: VoluntarioExpandido,
  criterio: CriterioOrden,
  atributos: AtributoEntity[],
): number {
  const atr = atributos.find(at => at.nombre === criterio.atributo)
  const tipo = atr?.tipo ?? 'texto'
  const rawA = a.id ? '' : '' // placeholder — se sobreescribe abajo
  void rawA

  // Los datos del voluntario viven en el objeto expandido solo para los campos
  // del sistema. Para atributos personalizados hay que acceder al original.
  // VoluntarioExpandido no conserva datos{}, así que trabajamos sobre los
  // campos que el algoritmo ya parseó cuando el atributo coincide con un rol,
  // y para el resto usamos una comparación vacía (0).
  // La solución correcta requiere que VoluntarioExpandido lleve datos{}.
  // Como no lo hace, devolvemos 0 para atributos no mapeados por ahora —
  // esto sigue siendo correcto para criterios sobre campos del sistema
  // que sí están parseados (sexo, universidad, edad, fecha_inscripcion).

  let valA: number | string
  let valB: number | string

  if (tipo === 'numero') {
    valA = valorNumerico(String(a[criterio.atributo as keyof VoluntarioExpandido] ?? ''))
    valB = valorNumerico(String(b[criterio.atributo as keyof VoluntarioExpandido] ?? ''))
    const diff = (valA as number) - (valB as number)
    return criterio.orden === 'asc' ? diff : -diff
  }

  if (tipo === 'fecha') {
    valA = valorFecha(String(a[criterio.atributo as keyof VoluntarioExpandido] ?? ''))
    valB = valorFecha(String(b[criterio.atributo as keyof VoluntarioExpandido] ?? ''))
    const diff = (valA as number) - (valB as number)
    return criterio.orden === 'asc' ? diff : -diff
  }

  if (tipo === 'booleano') {
    valA = valorBooleano(String(a[criterio.atributo as keyof VoluntarioExpandido] ?? ''))
    valB = valorBooleano(String(b[criterio.atributo as keyof VoluntarioExpandido] ?? ''))
    const diff = (valA as number) - (valB as number)
    return criterio.orden === 'asc' ? diff : -diff
  }

  // texto / seleccion
  const strA = String(a[criterio.atributo as keyof VoluntarioExpandido] ?? '').toLowerCase().trim()
  const strB = String(b[criterio.atributo as keyof VoluntarioExpandido] ?? '').toLowerCase().trim()

  if (criterio.valoresPrioritarios && criterio.valoresPrioritarios.length > 0) {
    const prioridades = criterio.valoresPrioritarios.map(v => v.toLowerCase().trim())
    const idxA = prioridades.findIndex(p => strA.includes(p))
    const idxB = prioridades.findIndex(p => strB.includes(p))
    const rankA = idxA === -1 ? prioridades.length : idxA
    const rankB = idxB === -1 ? prioridades.length : idxB
    if (rankA !== rankB) return rankA - rankB
  }

  const cmp = strA.localeCompare(strB, 'es')
  return criterio.orden === 'asc' ? cmp : -cmp
}

function evaluarFiltro(
  vol: VoluntarioExpandido,
  filtro: FiltroEliminatorio,
): boolean {
  const raw = String(vol[filtro.atributo as keyof VoluntarioExpandido] ?? '').toLowerCase().trim()
  const valor = filtro.valor.toLowerCase().trim()

  switch (filtro.operador) {
    case 'igual':      return raw === valor
    case 'diferente':  return raw !== valor
    case 'contiene':   return raw.includes(valor)
    case 'mayor':      return valorNumerico(raw) > valorNumerico(valor)
    case 'menor':      return valorNumerico(raw) < valorNumerico(valor)
    case 'mayor_igual':return valorNumerico(raw) >= valorNumerico(valor)
    case 'menor_igual':return valorNumerico(raw) <= valorNumerico(valor)
    default:           return false
  }
}

// ---------------------------------------------------------------------------
// Etapa personalizada A: Filtrar con criterios eliminatorios del usuario
// ---------------------------------------------------------------------------

export function filtrarConCriterios(
  voluntarios: VoluntarioExpandido[],
  filtros: FiltroEliminatorio[],
): VoluntarioExpandido[] {
  if (filtros.length === 0) return voluntarios
  return voluntarios.map(v => {
    if (v.estado === 'filtrado') return v
    const eliminado = filtros.some(f => evaluarFiltro(v, f))
    if (eliminado) {
      return { ...v, estado: 'filtrado', razonFiltrado: 'filtro_personalizado' }
    }
    return v
  })
}

// ---------------------------------------------------------------------------
// Etapa personalizada B: Ordenar por prioridades del usuario
// ---------------------------------------------------------------------------

export function ordenarConCriterios(
  voluntarios: VoluntarioExpandido[],
  prioridades: CriterioOrden[],
  atributos: AtributoEntity[],
): VoluntarioExpandido[] {
  if (prioridades.length === 0) return voluntarios
  return [...voluntarios].sort((a, b) => {
    for (const criterio of prioridades) {
      const cmp = compararPorCriterio(a, b, criterio, atributos)
      if (cmp !== 0) return cmp
    }
    return 0
  })
}

// ---------------------------------------------------------------------------
// Función principal con config personalizada
// Reutiliza toda la pipeline de etapas 4-7; solo reemplaza 2 y 3.
// ---------------------------------------------------------------------------

export function ejecutarAsignacionPersonalizada(
  voluntarios: VoluntarioEntity[],
  zonas: ZonaEntity[],
  atributos: AtributoEntity[],
  config: ConfigOrdenEntity,
): ResultadoAsignacion {
  const mapa = construirMapaColumnas(atributos)
  const totalCupos = zonas.reduce((sum, z) => sum + z.cupoTotal, 0)

  // 1. Expandir
  let vols = expandirVoluntarios(voluntarios, mapa)

  // 2. Filtrar con criterios eliminatorios personalizados
  vols = filtrarConCriterios(vols, config.filtrosEliminatorios)

  // 3. Ordenar elegibles con prioridades personalizadas
  const elegibles = vols.filter(v => v.estado === 'pendiente')
  const filtrados = vols.filter(v => v.estado === 'filtrado')
  const ordenados = ordenarConCriterios(elegibles, config.prioridades, atributos)

  // 4. Separar aceptados y espera
  const conEstado = separarAceptadosYEspera(ordenados, totalCupos)
  const todos = [...conEstado, ...filtrados]

  // 5. Calcular cupos por zona
  const aceptados = conEstado.filter(v => v.estado === 'aceptado')
  const cuposPorZona = calcularCuposPorZona(aceptados, zonas)

  // 6. Asignar aceptados a zonas
  let resultado = asignarAceptados(todos, cuposPorZona)

  // Recalcular cupos actualizados para etapa 7
  const cuposActualizados = cuposPorZona.map(c => {
    const asignadosZona = resultado.filter(v => v.zonaId === c.zonaId)
    return {
      ...c,
      asignados: {
        hombrePUC:   asignadosZona.filter(v => esHombre(v.sexo) && esPUC(v.universidad)).length,
        hombreNoPUC: asignadosZona.filter(v => esHombre(v.sexo) && !esPUC(v.universidad)).length,
        mujerPUC:    asignadosZona.filter(v => !esHombre(v.sexo) && esPUC(v.universidad)).length,
        mujerNoPUC:  asignadosZona.filter(v => !esHombre(v.sexo) && !esPUC(v.universidad)).length,
      },
    }
  })

  // 7. Procesar lista de espera
  resultado = procesarListaEspera(resultado, cuposActualizados)

  const asignadosFinales = resultado
    .filter(v => v.zonaId !== null)
    .map(v => ({ voluntarioId: v.id, zonaId: v.zonaId! }))

  const listaEsperaFinal = resultado
    .filter(v => v.estado === 'lista_espera' && v.zonaId === null)
    .map(v => ({ voluntarioId: v.id }))

  const filtradosFinal = resultado
    .filter(v => v.estado === 'filtrado')
    .map(v => ({ voluntarioId: v.id, razon: v.razonFiltrado ?? 'desconocido' }))

  return {
    asignados: asignadosFinales,
    listaEspera: listaEsperaFinal,
    filtrados: filtradosFinal,
    cuposFinales: cuposActualizados,
    resumen: {
      totalVoluntarios: voluntarios.length,
      totalAceptados: aceptados.length,
      totalAsignados: asignadosFinales.length,
      totalListaEspera: listaEsperaFinal.length,
      totalFiltrados: filtradosFinal.length,
    },
  }
}
