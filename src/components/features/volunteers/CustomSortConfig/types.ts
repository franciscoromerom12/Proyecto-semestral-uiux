import type { CriterioOrden, FiltroEliminatorio, OperadorFiltro } from '@/lib/domain/config-orden/types'

export type { CriterioOrden, FiltroEliminatorio, OperadorFiltro }

export const OPERADORES_TEXTO: { value: OperadorFiltro; label: string }[] = [
  { value: 'igual', label: 'es igual a' },
  { value: 'diferente', label: 'es diferente de' },
  { value: 'contiene', label: 'contiene' },
  { value: 'mayor', label: 'mayor que' },
  { value: 'menor', label: 'menor que' },
  { value: 'mayor_igual', label: 'mayor o igual a' },
  { value: 'menor_igual', label: 'menor o igual a' },
]

export const OPERADORES_NUMERO: { value: OperadorFiltro; label: string }[] = [
  { value: 'igual', label: 'igual a' },
  { value: 'diferente', label: 'diferente de' },
  { value: 'mayor', label: 'mayor que' },
  { value: 'menor', label: 'menor que' },
  { value: 'mayor_igual', label: 'mayor o igual a' },
  { value: 'menor_igual', label: 'menor o igual a' },
]

export const OPERADORES_BOOLEANO: { value: OperadorFiltro; label: string }[] = [
  { value: 'igual', label: 'es' },
  { value: 'diferente', label: 'no es' },
]
