export type ServiceType = 'CHAUFFAGE' | 'CLIMATISATION' | 'VMC' | 'PLOMBERIE' | 'ELECTRICITE' | 'ENTRETIEN' | 'RENOVATION'
export type HousingType = 'APPARTEMENT' | 'MAISON' | 'LOCAL_COMMERCIAL'
export type BuildingAge = 'NEUF' | 'MOINS_10_ANS' | 'DIX_VINGT_ANS' | 'PLUS_20_ANS'
export type Urgency = 'URGENT' | 'PLANIFIE'

export interface EstimationInput {
  serviceType: ServiceType
  housingType: HousingType
  surface: number
  buildingAge: BuildingAge
  urgency: Urgency
  specificities: string[]
}

export interface EstimationFactorImpact {
  key: string
  label: string
  impactPercent: number
  direction: 'up' | 'down' | 'neutral'
}

export interface EstimationResult {
  min: number
  max: number
  label: string
  details: string[]
  lowFactors: string[]
  highFactors: string[]
  breakdown: EstimationFactorImpact[]
}

// Fourchettes resserrées — ratio max/min ~2x (was ~4x)
const BASE_PRICES: Record<ServiceType, { min: number; max: number; label: string }> = {
  CHAUFFAGE:     { min: 1500, max: 3000,  label: 'Installation / remplacement chauffage' },
  CLIMATISATION: { min: 900,  max: 2000,  label: 'Installation climatisation réversible' },
  VMC:           { min: 500,  max: 1500,  label: 'Installation VMC' },
  PLOMBERIE:     { min: 200,  max: 800,   label: 'Travaux de plomberie' },
  ELECTRICITE:   { min: 300,  max: 1000,  label: 'Travaux électriques' },
  ENTRETIEN:     { min: 90,   max: 220,   label: 'Entretien / maintenance' },
  RENOVATION:    { min: 3000, max: 10000, label: 'Rénovation complète' },
}

export function calculateEstimation(input: EstimationInput): EstimationResult {
  const base = BASE_PRICES[input.serviceType]
  let minFactor = 1
  let maxFactor = 1
  const details: string[] = []
  const lowFactors: string[] = []
  const highFactors: string[] = []
  const breakdown: EstimationFactorImpact[] = []

  const applyFactor = (key: string, label: string, minMult: number, maxMult: number) => {
    minFactor *= minMult
    maxFactor *= maxMult
    const impactPercent = Math.round(((minMult + maxMult) / 2 - 1) * 100)
    breakdown.push({
      key,
      label,
      impactPercent,
      direction: impactPercent > 0 ? 'up' : impactPercent < 0 ? 'down' : 'neutral',
    })
  }

  // Surface
  if (input.surface <= 30) {
    applyFactor('surface', `Petite surface (${input.surface} m²)`, 0.85, 0.9)
    details.push(`Petit logement (${input.surface} m²)`)
    lowFactors.push(`Petite surface (${input.surface} m²) — moins de matériaux et de main-d'œuvre`)
  } else if (input.surface <= 60) {
    applyFactor('surface', `Surface standard (${input.surface} m²)`, 1, 1)
    details.push(`Surface standard (${input.surface} m²)`)
  } else if (input.surface <= 100) {
    applyFactor('surface', `Surface importante (${input.surface} m²)`, 1.15, 1.2)
    details.push(`Surface importante (${input.surface} m²)`)
    highFactors.push(`Surface importante (${input.surface} m²) — plus de matériaux nécessaires`)
  } else {
    applyFactor('surface', `Grande surface (${input.surface} m²)`, 1.35, 1.45)
    details.push(`Grande surface (${input.surface} m²)`)
    highFactors.push(`Grande surface (${input.surface} m²) — volume de travaux significatif`)
  }

  // Type de logement
  if (input.housingType === 'MAISON') {
    applyFactor('housingType', 'Maison individuelle', 1.1, 1.15)
    details.push('Maison individuelle')
    highFactors.push('Maison individuelle — accès toiture ou combles souvent nécessaire')
  } else if (input.housingType === 'LOCAL_COMMERCIAL') {
    applyFactor('housingType', 'Local commercial', 1.15, 1.25)
    details.push('Local commercial')
    highFactors.push('Local commercial — contraintes techniques et réglementaires spécifiques')
  } else {
    applyFactor('housingType', 'Appartement', 1, 1)
    lowFactors.push('Appartement — configuration standard, pas de contrainte toiture')
  }

  // Âge du bâtiment
  if (input.buildingAge === 'PLUS_20_ANS') {
    applyFactor('buildingAge', 'Bâtiment ancien (> 20 ans)', 1.1, 1.2)
    details.push('Bâtiment ancien (> 20 ans)')
    highFactors.push('Bâtiment de plus de 20 ans — adaptations ou mises aux normes possibles')
  } else if (input.buildingAge === 'NEUF') {
    applyFactor('buildingAge', 'Bâtiment neuf', 0.9, 0.95)
    details.push('Bâtiment neuf')
    lowFactors.push('Bâtiment neuf — installation simplifiée, pas d\'adaptation nécessaire')
  } else if (input.buildingAge === 'MOINS_10_ANS') {
    applyFactor('buildingAge', 'Bâtiment récent (< 10 ans)', 1, 1)
    details.push('Bâtiment récent (< 10 ans)')
    lowFactors.push('Bâtiment récent — peu d\'imprévus attendus')
  } else {
    applyFactor('buildingAge', 'Bâtiment de 10 à 20 ans', 1, 1)
    details.push('Bâtiment de 10 à 20 ans')
  }

  // Urgence
  if (input.urgency === 'URGENT') {
    applyFactor('urgency', 'Intervention urgente', 1.15, 1.15)
    details.push('Intervention urgente')
    highFactors.push('Intervention urgente — majoration pour mobilisation rapide')
  } else {
    applyFactor('urgency', 'Travaux planifiés', 1, 1)
    details.push('Travaux planifiés')
    lowFactors.push('Travaux planifiés — pas de majoration urgence')
  }

  // Spécificités
  if (input.specificities.includes('ACCESS_DIFFICILE')) {
    applyFactor('ACCESS_DIFFICILE', 'Accès difficile', 1.1, 1.15)
    details.push('Accès difficile')
    highFactors.push('Accès difficile — majoration temps de déplacement et manutention')
  }
  if (input.specificities.includes('COPROPRIETE')) {
    applyFactor('COPROPRIETE', 'Copropriété / Syndic', 1, 1)
    details.push('Copropriété')
    highFactors.push('Copropriété — coordination syndic et contraintes horaires possibles')
  }
  if (input.specificities.includes('MULTI_PIECES')) {
    applyFactor('MULTI_PIECES', 'Plusieurs pièces', 1.2, 1.25)
    details.push('Multi-pièces')
    highFactors.push('Installation multi-pièces — plusieurs unités intérieures')
  }
  if (input.specificities.includes('TRAVAUX_SOUS_TENSION')) {
    applyFactor('TRAVAUX_SOUS_TENSION', 'Travaux sous tension', 1.1, 1.15)
    details.push('Travaux sous tension')
    highFactors.push('Travaux sous tension — précautions de sécurité et coordination de coupure')
  }
  if (input.specificities.includes('EXISTANT_A_REMPLACER')) {
    applyFactor('EXISTANT_A_REMPLACER', 'Équipement existant à déposer', 1.05, 1.1)
    details.push('Dépose d\'un équipement existant')
    highFactors.push('Équipement existant à déposer — dépose et évacuation de l\'ancien matériel incluses')
  }
  if (input.specificities.includes('ETAGE_SANS_ASCENSEUR')) {
    applyFactor('ETAGE_SANS_ASCENSEUR', 'Étage sans ascenseur', 1.1, 1.15)
    details.push('Étage sans ascenseur')
    highFactors.push('Étage sans ascenseur — manutention du matériel plus longue')
  }
  if (input.specificities.includes('MISE_AUX_NORMES')) {
    applyFactor('MISE_AUX_NORMES', 'Mise aux normes nécessaire', 1.1, 1.2)
    details.push('Mise aux normes nécessaire')
    highFactors.push('Mise aux normes nécessaire — contrôles et adaptations réglementaires supplémentaires')
  }

  if (lowFactors.length === 0) {
    lowFactors.push('Chantier standard sans complication particulière')
  }
  if (highFactors.length === 0) {
    highFactors.push('Matériaux haut de gamme ou spécificités découvertes lors de la visite')
  }

  return {
    min: Math.round(base.min * minFactor / 50) * 50,
    max: Math.round(base.max * maxFactor / 50) * 50,
    label: base.label,
    details,
    lowFactors,
    highFactors,
    breakdown,
  }
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  CHAUFFAGE: 'Chauffage (chaudière, PAC…)',
  CLIMATISATION: 'Climatisation',
  VMC: 'Ventilation (VMC)',
  PLOMBERIE: 'Plomberie',
  ELECTRICITE: 'Électricité',
  ENTRETIEN: 'Entretien / Maintenance',
  RENOVATION: 'Rénovation complète',
}

export const HOUSING_LABELS: Record<HousingType, string> = {
  APPARTEMENT: 'Appartement',
  MAISON: 'Maison individuelle',
  LOCAL_COMMERCIAL: 'Local commercial / Bureau',
}

export const BUILDING_AGE_LABELS: Record<BuildingAge, string> = {
  NEUF: 'Neuf (< 2 ans)',
  MOINS_10_ANS: 'Moins de 10 ans',
  DIX_VINGT_ANS: '10 à 20 ans',
  PLUS_20_ANS: 'Plus de 20 ans',
}
