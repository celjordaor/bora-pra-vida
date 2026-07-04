/**
 * Separa uma frase ditada em múltiplos itens, ex.:
 * "leite, pão, ovos e detergente" -> ["leite", "pão", "ovos", "detergente"]
 */
export function parseSpokenItems(text: string): string[] {
  return text
    .split(/,|\be\b/gi)
    .map((s) => s.trim())
    .filter(Boolean)
}
