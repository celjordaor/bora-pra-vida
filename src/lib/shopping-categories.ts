function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Palpite inicial (nomes batem com as categorias padrão criadas pro
// usuário). Se o usuário renomeou/excluiu essas categorias, o palpite cai
// pra "Outros" (ver suggestCategoryName abaixo).
const KEYWORD_MAP: Record<string, string> = {
  // hortifruti
  alface: 'Hortifruti',
  tomate: 'Hortifruti',
  cebola: 'Hortifruti',
  batata: 'Hortifruti',
  cenoura: 'Hortifruti',
  banana: 'Hortifruti',
  maçã: 'Hortifruti',
  laranja: 'Hortifruti',
  limão: 'Hortifruti',
  uva: 'Hortifruti',
  mamão: 'Hortifruti',
  abacate: 'Hortifruti',
  pepino: 'Hortifruti',
  brócolis: 'Hortifruti',
  couve: 'Hortifruti',
  repolho: 'Hortifruti',
  pimentão: 'Hortifruti',
  alho: 'Hortifruti',

  // açougue
  carne: 'Açougue',
  frango: 'Açougue',
  peixe: 'Açougue',
  linguiça: 'Açougue',
  bacon: 'Açougue',
  bife: 'Açougue',
  costela: 'Açougue',
  picanha: 'Açougue',

  // padaria
  pão: 'Padaria',
  bisnaguinha: 'Padaria',
  baguete: 'Padaria',
  torrada: 'Padaria',

  // laticínios
  leite: 'Laticínios',
  queijo: 'Laticínios',
  iogurte: 'Laticínios',
  manteiga: 'Laticínios',
  requeijão: 'Laticínios',
  'creme de leite': 'Laticínios',

  // mercearia
  arroz: 'Mercearia',
  feijão: 'Mercearia',
  macarrão: 'Mercearia',
  óleo: 'Mercearia',
  açúcar: 'Mercearia',
  sal: 'Mercearia',
  farinha: 'Mercearia',
  café: 'Mercearia',
  molho: 'Mercearia',
  biscoito: 'Mercearia',
  bolacha: 'Mercearia',

  // bebidas
  refrigerante: 'Bebidas',
  suco: 'Bebidas',
  cerveja: 'Bebidas',
  água: 'Bebidas',
  vinho: 'Bebidas',

  // limpeza
  detergente: 'Limpeza',
  sabão: 'Limpeza',
  desinfetante: 'Limpeza',
  amaciante: 'Limpeza',
  esponja: 'Limpeza',
  vassoura: 'Limpeza',

  // higiene
  shampoo: 'Higiene',
  condicionador: 'Higiene',
  sabonete: 'Higiene',
  'creme dental': 'Higiene',
  'papel higiênico': 'Higiene',
  desodorante: 'Higiene',
  absorvente: 'Higiene',
  fralda: 'Higiene',
}

function suggestCategoryGuess(name: string): string {
  const normalized = stripAccents(name.toLowerCase().trim())
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (normalized.includes(stripAccents(keyword))) return category
  }
  return 'Outros'
}

/**
 * Sugere a categoria pro item, considerando as categorias de verdade do
 * usuário (que podem ter sido renomeadas, desativadas ou excluídas). Se o
 * palpite não existir mais, cai pra "Outros" ou a primeira categoria ativa.
 */
export function suggestCategoryName(
  itemName: string,
  categories: { name: string; active: boolean }[]
): string {
  const guess = suggestCategoryGuess(itemName)
  const match = categories.find(
    (c) => c.active && c.name.toLowerCase() === guess.toLowerCase()
  )
  if (match) return match.name

  const outros = categories.find((c) => c.active && c.name.toLowerCase() === 'outros')
  if (outros) return outros.name

  return categories.find((c) => c.active)?.name ?? 'Outros'
}
