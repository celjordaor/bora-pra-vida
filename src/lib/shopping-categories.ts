export const CATEGORY_ORDER = [
  'hortifruti',
  'acougue',
  'padaria',
  'laticinios',
  'mercearia',
  'bebidas',
  'limpeza',
  'higiene',
  'outros',
] as const

export type ShoppingCategory = (typeof CATEGORY_ORDER)[number]

export const CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  hortifruti: 'Hortifruti',
  acougue: 'Açougue',
  padaria: 'Padaria',
  laticinios: 'Laticínios',
  mercearia: 'Mercearia',
  bebidas: 'Bebidas',
  limpeza: 'Limpeza',
  higiene: 'Higiene',
  outros: 'Outros',
}

const KEYWORD_MAP: Record<string, ShoppingCategory> = {
  // hortifruti
  alface: 'hortifruti',
  tomate: 'hortifruti',
  cebola: 'hortifruti',
  batata: 'hortifruti',
  cenoura: 'hortifruti',
  banana: 'hortifruti',
  maçã: 'hortifruti',
  laranja: 'hortifruti',
  limão: 'hortifruti',
  uva: 'hortifruti',
  mamão: 'hortifruti',
  abacate: 'hortifruti',
  pepino: 'hortifruti',
  brócolis: 'hortifruti',
  couve: 'hortifruti',
  repolho: 'hortifruti',
  pimentão: 'hortifruti',
  alho: 'hortifruti',

  // açougue
  carne: 'acougue',
  frango: 'acougue',
  peixe: 'acougue',
  linguiça: 'acougue',
  bacon: 'acougue',
  bife: 'acougue',
  costela: 'acougue',
  picanha: 'acougue',

  // padaria
  pão: 'padaria',
  bisnaguinha: 'padaria',
  baguete: 'padaria',
  torrada: 'padaria',

  // laticínios
  leite: 'laticinios',
  queijo: 'laticinios',
  iogurte: 'laticinios',
  manteiga: 'laticinios',
  requeijão: 'laticinios',
  'creme de leite': 'laticinios',

  // mercearia
  arroz: 'mercearia',
  feijão: 'mercearia',
  macarrão: 'mercearia',
  óleo: 'mercearia',
  açúcar: 'mercearia',
  sal: 'mercearia',
  farinha: 'mercearia',
  café: 'mercearia',
  molho: 'mercearia',
  biscoito: 'mercearia',
  bolacha: 'mercearia',

  // bebidas
  refrigerante: 'bebidas',
  suco: 'bebidas',
  cerveja: 'bebidas',
  água: 'bebidas',
  vinho: 'bebidas',

  // limpeza
  detergente: 'limpeza',
  sabão: 'limpeza',
  desinfetante: 'limpeza',
  amaciante: 'limpeza',
  esponja: 'limpeza',
  vassoura: 'limpeza',

  // higiene
  shampoo: 'higiene',
  condicionador: 'higiene',
  sabonete: 'higiene',
  'creme dental': 'higiene',
  'papel higiênico': 'higiene',
  desodorante: 'higiene',
  absorvente: 'higiene',
  fralda: 'higiene',
}

function stripAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function suggestCategory(name: string): ShoppingCategory {
  const normalized = stripAccents(name.toLowerCase().trim())

  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (normalized.includes(stripAccents(keyword))) return category
  }
  return 'outros'
}
