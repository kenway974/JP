import { prisma } from './prisma'
import type { ServiceType } from './estimation'

export const BASE_PRICE_DEFAULTS: Record<ServiceType, { min: number; max: number; label: string }> = {
  CHAUFFAGE:     { min: 1500, max: 3000,  label: 'Installation / remplacement chauffage' },
  CLIMATISATION: { min: 900,  max: 2000,  label: 'Installation climatisation réversible' },
  VMC:           { min: 500,  max: 1500,  label: 'Installation VMC' },
  PLOMBERIE:     { min: 200,  max: 800,   label: 'Travaux de plomberie' },
  ELECTRICITE:   { min: 300,  max: 1000,  label: 'Travaux électriques' },
  ENTRETIEN:     { min: 90,   max: 220,   label: 'Entretien / maintenance' },
  RENOVATION:    { min: 3000, max: 10000, label: 'Rénovation complète' },
}

export interface FactorMultiplier {
  minMultiplier: number
  maxMultiplier: number
  active: boolean
}

// Valeurs par défaut — utilisées si l'admin n'a encore rien personnalisé.
export const FACTOR_DEFAULTS: Record<string, { minMultiplier: number; maxMultiplier: number }> = {
  surface_small: { minMultiplier: 0.85, maxMultiplier: 0.9 },
  surface_large: { minMultiplier: 1.15, maxMultiplier: 1.2 },
  surface_xlarge: { minMultiplier: 1.35, maxMultiplier: 1.45 },
  housingType_MAISON: { minMultiplier: 1.1, maxMultiplier: 1.15 },
  housingType_LOCAL_COMMERCIAL: { minMultiplier: 1.15, maxMultiplier: 1.25 },
  buildingAge_PLUS_20_ANS: { minMultiplier: 1.1, maxMultiplier: 1.2 },
  buildingAge_NEUF: { minMultiplier: 0.9, maxMultiplier: 0.95 },
  urgency_URGENT: { minMultiplier: 1.15, maxMultiplier: 1.15 },
  ACCESS_DIFFICILE: { minMultiplier: 1.1, maxMultiplier: 1.15 },
  MULTI_PIECES: { minMultiplier: 1.2, maxMultiplier: 1.25 },
  TRAVAUX_SOUS_TENSION: { minMultiplier: 1.1, maxMultiplier: 1.15 },
  EXISTANT_A_REMPLACER: { minMultiplier: 1.05, maxMultiplier: 1.1 },
  ETAGE_SANS_ASCENSEUR: { minMultiplier: 1.1, maxMultiplier: 1.15 },
  MISE_AUX_NORMES: { minMultiplier: 1.1, maxMultiplier: 1.2 },
  STATIONNEMENT_ELOIGNE: { minMultiplier: 1.05, maxMultiplier: 1.08 },
  INTERVENTION_WEEKEND: { minMultiplier: 1.1, maxMultiplier: 1.15 },
  CONDUITS_A_CREER: { minMultiplier: 1.15, maxMultiplier: 1.25 },
  DIAGNOSTIC_AMIANTE: { minMultiplier: 1.1, maxMultiplier: 1.15 },
  DEJA_CLIENT: { minMultiplier: 0.92, maxMultiplier: 0.95 },
}

export const FACTOR_LABELS: Record<string, string> = {
  surface_small: 'Petite surface (≤ 30 m²)',
  surface_large: 'Surface importante (61 à 100 m²)',
  surface_xlarge: 'Grande surface (> 100 m²)',
  housingType_MAISON: 'Maison individuelle',
  housingType_LOCAL_COMMERCIAL: 'Local commercial',
  buildingAge_PLUS_20_ANS: 'Bâtiment de plus de 20 ans',
  buildingAge_NEUF: 'Bâtiment neuf',
  urgency_URGENT: 'Intervention urgente',
  ACCESS_DIFFICILE: 'Accès difficile',
  MULTI_PIECES: 'Plusieurs pièces',
  TRAVAUX_SOUS_TENSION: 'Travaux sous tension',
  EXISTANT_A_REMPLACER: 'Équipement existant à déposer',
  ETAGE_SANS_ASCENSEUR: 'Étage sans ascenseur',
  MISE_AUX_NORMES: 'Mise aux normes nécessaire',
  STATIONNEMENT_ELOIGNE: 'Stationnement / accès véhicule éloigné',
  INTERVENTION_WEEKEND: 'Intervention le week-end',
  CONDUITS_A_CREER: 'Création de gaines ou conduits nécessaire',
  DIAGNOSTIC_AMIANTE: 'Diagnostic amiante requis (bâti avant 1997)',
  DEJA_CLIENT: 'Client déjà sous contrat d\'entretien',
}

export async function getBasePrice(serviceType: ServiceType): Promise<{ min: number; max: number; label: string }> {
  try {
    const row = await prisma.estimationBasePrice.findUnique({ where: { serviceType } })
    if (row) return { min: row.min, max: row.max, label: BASE_PRICE_DEFAULTS[serviceType].label }
  } catch {
    // Base indisponible → valeurs par défaut
  }
  return BASE_PRICE_DEFAULTS[serviceType]
}

export async function getFactorOverrides(): Promise<Record<string, FactorMultiplier>> {
  try {
    const rows = await prisma.estimationFactor.findMany()
    const map: Record<string, FactorMultiplier> = {}
    for (const row of rows) {
      map[row.key] = { minMultiplier: row.minMultiplier, maxMultiplier: row.maxMultiplier, active: row.active }
    }
    return map
  } catch {
    return {}
  }
}
