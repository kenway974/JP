import { getBasePrice, getFactorOverrides } from './estimation-config'

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

// Marge d'incertitude autour du prix central : large tant qu'on ne sait presque rien du
// chantier, resserrée à mesure que le client coche des particularités concrètes. Ça évite
// qu'une fourchette s'élargisse indéfiniment au fil du formulaire (ce qu'un simple produit
// de multiplicateurs min/max ferait), et donne un prix affiché plus utile au client.
const BASE_UNCERTAINTY = 0.24
const UNCERTAINTY_STEP_PER_CRITERION = 0.018
const MIN_UNCERTAINTY = 0.08

export async function calculateEstimation(input: EstimationInput): Promise<EstimationResult> {
  const [base, overrides] = await Promise.all([getBasePrice(input.serviceType), getFactorOverrides()])

  let pointFactor = 1
  const details: string[] = []
  const lowFactors: string[] = []
  const highFactors: string[] = []
  const breakdown: EstimationFactorImpact[] = []

  // overrideKey: nom sous lequel l'admin peut personnaliser ce multiplicateur (undefined = non personnalisable)
  const applyFactor = (
    breakdownKey: string,
    label: string,
    defaultMin: number,
    defaultMax: number,
    overrideKey?: string
  ) => {
    const override = overrideKey ? overrides[overrideKey] : undefined
    const disabled = override?.active === false
    const minMult = disabled ? 1 : override?.minMultiplier ?? defaultMin
    const maxMult = disabled ? 1 : override?.maxMultiplier ?? defaultMax
    const mult = (minMult + maxMult) / 2
    pointFactor *= mult
    const impactPercent = Math.round((mult - 1) * 100)
    breakdown.push({
      key: breakdownKey,
      label,
      impactPercent,
      direction: impactPercent > 0 ? 'up' : impactPercent < 0 ? 'down' : 'neutral',
    })
  }

  // Surface
  if (input.surface <= 30) {
    applyFactor('surface', `Petite surface (${input.surface} m²)`, 0.85, 0.9, 'surface_small')
    details.push(`Petit logement (${input.surface} m²)`)
    lowFactors.push(`Petite surface (${input.surface} m²) — moins de matériaux et de main-d'œuvre`)
  } else if (input.surface <= 60) {
    applyFactor('surface', `Surface standard (${input.surface} m²)`, 1, 1)
    details.push(`Surface standard (${input.surface} m²)`)
  } else if (input.surface <= 100) {
    applyFactor('surface', `Surface importante (${input.surface} m²)`, 1.15, 1.2, 'surface_large')
    details.push(`Surface importante (${input.surface} m²)`)
    highFactors.push(`Surface importante (${input.surface} m²) — plus de matériaux nécessaires`)
  } else {
    applyFactor('surface', `Grande surface (${input.surface} m²)`, 1.35, 1.45, 'surface_xlarge')
    details.push(`Grande surface (${input.surface} m²)`)
    highFactors.push(`Grande surface (${input.surface} m²) — volume de travaux significatif`)
  }

  // Type de logement
  if (input.housingType === 'MAISON') {
    applyFactor('housingType', 'Maison individuelle', 1.1, 1.15, 'housingType_MAISON')
    details.push('Maison individuelle')
    highFactors.push('Maison individuelle — accès toiture ou combles souvent nécessaire')
  } else if (input.housingType === 'LOCAL_COMMERCIAL') {
    applyFactor('housingType', 'Local commercial', 1.15, 1.25, 'housingType_LOCAL_COMMERCIAL')
    details.push('Local commercial')
    highFactors.push('Local commercial — contraintes techniques et réglementaires spécifiques')
  } else {
    applyFactor('housingType', 'Appartement', 1, 1)
    lowFactors.push('Appartement — configuration standard, pas de contrainte toiture')
  }

  // Âge du bâtiment
  if (input.buildingAge === 'PLUS_20_ANS') {
    applyFactor('buildingAge', 'Bâtiment ancien (> 20 ans)', 1.1, 1.2, 'buildingAge_PLUS_20_ANS')
    details.push('Bâtiment ancien (> 20 ans)')
    highFactors.push('Bâtiment de plus de 20 ans — adaptations ou mises aux normes possibles')
  } else if (input.buildingAge === 'NEUF') {
    applyFactor('buildingAge', 'Bâtiment neuf', 0.9, 0.95, 'buildingAge_NEUF')
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
    applyFactor('urgency', 'Intervention urgente', 1.15, 1.15, 'urgency_URGENT')
    details.push('Intervention urgente')
    highFactors.push('Intervention urgente — majoration pour mobilisation rapide')
  } else {
    applyFactor('urgency', 'Travaux planifiés', 1, 1)
    details.push('Travaux planifiés')
    lowFactors.push('Travaux planifiés — pas de majoration urgence')
  }

  // Spécificités
  if (input.specificities.includes('ACCESS_DIFFICILE')) {
    applyFactor('ACCESS_DIFFICILE', 'Accès difficile', 1.1, 1.15, 'ACCESS_DIFFICILE')
    details.push('Accès difficile')
    highFactors.push('Accès difficile — majoration temps de déplacement et manutention')
  }
  if (input.specificities.includes('COPROPRIETE')) {
    applyFactor('COPROPRIETE', 'Copropriété / Syndic', 1.05, 1.1, 'COPROPRIETE')
    details.push('Copropriété')
    highFactors.push('Copropriété — coordination syndic et contraintes horaires possibles')
  }
  if (input.specificities.includes('MULTI_PIECES')) {
    applyFactor('MULTI_PIECES', 'Plusieurs pièces', 1.2, 1.25, 'MULTI_PIECES')
    details.push('Multi-pièces')
    highFactors.push('Installation multi-pièces — plusieurs unités intérieures')
  }
  if (input.specificities.includes('TRAVAUX_SOUS_TENSION')) {
    applyFactor('TRAVAUX_SOUS_TENSION', 'Travaux sous tension', 1.1, 1.15, 'TRAVAUX_SOUS_TENSION')
    details.push('Travaux sous tension')
    highFactors.push('Travaux sous tension — précautions de sécurité et coordination de coupure')
  }
  if (input.specificities.includes('EXISTANT_A_REMPLACER')) {
    applyFactor('EXISTANT_A_REMPLACER', 'Équipement existant à déposer', 1.05, 1.1, 'EXISTANT_A_REMPLACER')
    details.push('Dépose d\'un équipement existant')
    highFactors.push('Équipement existant à déposer — dépose et évacuation de l\'ancien matériel incluses')
  }
  if (input.specificities.includes('ETAGE_SANS_ASCENSEUR')) {
    applyFactor('ETAGE_SANS_ASCENSEUR', 'Étage sans ascenseur', 1.1, 1.15, 'ETAGE_SANS_ASCENSEUR')
    details.push('Étage sans ascenseur')
    highFactors.push('Étage sans ascenseur — manutention du matériel plus longue')
  }
  if (input.specificities.includes('MISE_AUX_NORMES')) {
    applyFactor('MISE_AUX_NORMES', 'Mise aux normes nécessaire', 1.1, 1.2, 'MISE_AUX_NORMES')
    details.push('Mise aux normes nécessaire')
    highFactors.push('Mise aux normes nécessaire — contrôles et adaptations réglementaires supplémentaires')
  }

  if (input.specificities.includes('STATIONNEMENT_ELOIGNE')) {
    applyFactor('STATIONNEMENT_ELOIGNE', 'Stationnement éloigné', 1.05, 1.08, 'STATIONNEMENT_ELOIGNE')
    details.push('Stationnement éloigné')
    highFactors.push('Stationnement éloigné — temps de portage du matériel supplémentaire')
  }
  if (input.specificities.includes('INTERVENTION_WEEKEND')) {
    applyFactor('INTERVENTION_WEEKEND', 'Intervention le week-end', 1.1, 1.15, 'INTERVENTION_WEEKEND')
    details.push('Intervention le week-end')
    highFactors.push('Intervention le week-end — majoration hors jours ouvrés')
  }
  if (input.specificities.includes('PREMIERE_INSTALLATION')) {
    applyFactor('PREMIERE_INSTALLATION', 'Première installation', 1.15, 1.25, 'PREMIERE_INSTALLATION')
    details.push('Première installation, aucun système existant')
    highFactors.push('Première installation — gaines et conduits à créer, pas de passage existant à réutiliser')
  }
  if (input.specificities.includes('DIAGNOSTIC_AMIANTE')) {
    applyFactor('DIAGNOSTIC_AMIANTE', 'Diagnostic amiante requis', 1.1, 1.15, 'DIAGNOSTIC_AMIANTE')
    details.push('Diagnostic amiante requis')
    highFactors.push('Bâti antérieur à 1997 — diagnostic amiante préalable obligatoire')
  }
  if (input.specificities.includes('DEJA_CLIENT')) {
    applyFactor('DEJA_CLIENT', 'Client sous contrat d\'entretien', 0.92, 0.95, 'DEJA_CLIENT')
    details.push('Client sous contrat d\'entretien')
    lowFactors.push('Client déjà sous contrat d\'entretien — tarif préférentiel')
  }

  if (lowFactors.length === 0) {
    lowFactors.push('Chantier standard sans complication particulière')
  }
  if (highFactors.length === 0) {
    highFactors.push('Matériaux haut de gamme ou spécificités découvertes lors de la visite')
  }

  const center = ((base.min + base.max) / 2) * pointFactor
  const uncertainty = Math.max(
    MIN_UNCERTAINTY,
    BASE_UNCERTAINTY - input.specificities.length * UNCERTAINTY_STEP_PER_CRITERION
  )

  return {
    min: Math.round((center * (1 - uncertainty)) / 50) * 50,
    max: Math.round((center * (1 + uncertainty)) / 50) * 50,
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
