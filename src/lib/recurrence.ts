import type { RecurrenceRule } from '@/types/activity'

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function describeRecurrence(rule: RecurrenceRule | null): string | null {
  if (!rule || rule.type === 'none') return null

  switch (rule.type) {
    case 'daily':
      return 'Repete diariamente'
    case 'weekly':
      return 'Repete semanalmente'
    case 'monthly':
      return 'Repete mensalmente'
    case 'custom':
      return `Repete a cada ${rule.intervalDays ?? 1} dia(s)`
    case 'weekdays': {
      const days = [...(rule.days ?? [])].sort()
      if (days.length === 0) return 'Repete em dias específicos'
      return `Repete: ${days.map((d) => WEEKDAY_LABELS[d]).join(', ')}`
    }
    default:
      return null
  }
}

function addDays(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function addMonths(dateISO: string, months: number): string {
  const d = new Date(`${dateISO}T00:00:00`)
  const originalDay = d.getDate()
  d.setMonth(d.getMonth() + months)
  // Se o mês de destino for mais curto (ex.: 31/01 -> 31/02 não existe),
  // volta pro último dia do mês certo em vez de "vazar" pro mês seguinte.
  if (d.getDate() !== originalDay) {
    d.setDate(0)
  }
  return d.toISOString().slice(0, 10)
}

/**
 * Calcula a próxima data de vencimento a partir da regra de recorrência e
 * da data atual da atividade. Retorna null se não houver regra (ou 'none')
 * ou se faltarem dados pra calcular (ex.: 'weekdays' sem nenhum dia marcado).
 */
export function computeNextDueDate(
  rule: RecurrenceRule | null,
  fromDateISO: string
): string | null {
  if (!rule || rule.type === 'none') return null

  switch (rule.type) {
    case 'daily':
      return addDays(fromDateISO, 1)
    case 'weekly':
      return addDays(fromDateISO, 7)
    case 'monthly':
      return addMonths(fromDateISO, 1)
    case 'custom':
      return addDays(fromDateISO, Math.max(1, rule.intervalDays ?? 1))
    case 'weekdays': {
      const days = rule.days ?? []
      if (days.length === 0) return null
      for (let offset = 1; offset <= 7; offset++) {
        const candidate = addDays(fromDateISO, offset)
        const weekday = new Date(`${candidate}T00:00:00`).getDay()
        if (days.includes(weekday)) return candidate
      }
      return null
    }
    default:
      return null
  }
}

export const WEEKDAYS = WEEKDAY_LABELS.map((label, index) => ({ index, label }))
