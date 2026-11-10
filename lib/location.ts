/**
 * Gestion grammaticale de la zone d'intervention.
 *
 * En français, la préposition dépend du type de lieu :
 *   - ville        → « à Paris », « au Mans », « aux Sables-d'Olonne », « à La Rochelle »
 *   - région       → « en Île-de-France », « dans le Grand Est », « dans les Hauts-de-France »
 *   - département  → « en Gironde », « dans le Val-de-Marne », « dans les Yvelines »
 *
 * Le genre d'une région / d'un département ne se devine pas de façon fiable :
 * on applique « en » par défaut et on laisse surcharger la préposition via
 * NEXT_PUBLIC_COMPANY_LOCATION_PREPOSITION (ex. « dans le »).
 *
 * Module sans dépendance Next.js : utilisable côté pages, emails et PDF.
 */

export type LocationType = 'ville' | 'region' | 'departement'

const LOCATION_TYPES: LocationType[] = ['ville', 'region', 'departement']

export function parseLocationType(value: string | undefined): LocationType {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  return LOCATION_TYPES.includes(normalized as LocationType) ? (normalized as LocationType) : 'ville'
}

/** Renvoie la zone précédée de la bonne préposition : « à Paris », « en Bretagne »… */
export function locationWithPreposition(name: string, type: LocationType, override?: string): string {
  const prep = override?.trim()
  if (prep) return prep.endsWith("'") ? `${prep}${name}` : `${prep} ${name}`

  // Article intégré au nom : « Le Mans », « Les Ulis », « La Rochelle », « Le Val-de-Marne »
  const article = name.match(/^(?:(Les|Le|La)\s+|(L'))(.+)$/)
  if (article) {
    const [, word, elided, rest] = article
    if (type === 'ville') {
      if (word === 'Le') return `au ${rest}`
      if (word === 'Les') return `aux ${rest}`
      return `à ${name}` // « à La Rochelle », « à L'Haÿ-les-Roses »
    }
    return elided ? `dans l'${rest}` : `dans ${word.toLowerCase()} ${rest}`
  }

  return type === 'ville' ? `à ${name}` : `en ${name}`
}
