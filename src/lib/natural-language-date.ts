export interface ParsedQuickAdd {
  title: string
  due_date: string | null
  due_time: string | null
}

const WEEKDAY_NAMES: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  'segunda-feira': 1,
  terça: 2,
  terca: 2,
  'terça-feira': 2,
  quarta: 3,
  'quarta-feira': 3,
  quinta: 4,
  'quinta-feira': 4,
  sexta: 5,
  'sexta-feira': 5,
  sábado: 6,
  sabado: 6,
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Extrai data e hora de uma frase em português e devolve o restante como
 * título. Reconhece: "hoje", "amanhã", nomes de dias da semana ("segunda",
 * "sexta-feira"...) e horários ("15h", "15h30", "15:30").
 *
 * Ex.: "reunião amanhã 15h" -> { title: "reunião", due_date: <amanhã>, due_time: "15:00" }
 */
export function parseQuickAdd(input: string): ParsedQuickAdd {
  let text = input.trim()
  let due_date: string | null = null
  let due_time: string | null = null

  // Horário: "15h", "15h30", "15:30", "às 15h"
  const timeMatch = text.match(/\b(\d{1,2})[:h](\d{2})?\b/i)
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0')
    const minutes = (timeMatch[2] ?? '00').padStart(2, '0')
    due_time = `${hours}:${minutes}`
    text = text.replace(timeMatch[0], '').trim()
  }

  const today = new Date()

  if (/\bhoje\b/i.test(text)) {
    due_date = toISO(today)
    text = text.replace(/\bhoje\b/i, '').trim()
  } else if (/\bamanh[ãa]\b/i.test(text)) {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    due_date = toISO(d)
    text = text.replace(/\bamanh[ãa]\b/i, '').trim()
  } else {
    for (const [name, weekday] of Object.entries(WEEKDAY_NAMES)) {
      const re = new RegExp(`\\b${name}\\b`, 'i')
      if (re.test(text)) {
        const d = new Date(today)
        // próxima ocorrência desse dia da semana (nunca "hoje", sempre pra frente)
        const diff = (weekday - d.getDay() + 7) % 7 || 7
        d.setDate(d.getDate() + diff)
        due_date = toISO(d)
        text = text.replace(re, '').trim()
        break
      }
    }
  }

  // Limpa conectores soltos que sobraram ("às", "de", espaços duplos)
  text = text
    .replace(/\b(às|as|de|do|da)\b/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return { title: text || input.trim(), due_date, due_time }
}
