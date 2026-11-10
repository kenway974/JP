import { locationWithPreposition, parseLocationType } from './location'

export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Chauffagiste'
export const COMPANY_SHORT_NAME = process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME || 'MonChauff'
export const COMPANY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE || 'XX XX XX XX XX'
export const COMPANY_PHONE_RAW = process.env.NEXT_PUBLIC_COMPANY_PHONE_RAW || 'XXXXXXXXXX'
export const COMPANY_EMAIL = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contact@example.com'
export const COMPANY_LOCATION = process.env.NEXT_PUBLIC_COMPANY_LOCATION || 'Votre ville'
/** 'ville' | 'region' | 'departement' — détermine la préposition (à / en / dans le…) */
export const COMPANY_LOCATION_TYPE = parseLocationType(process.env.NEXT_PUBLIC_COMPANY_LOCATION_TYPE)
/** Zone précédée de sa préposition : « à Paris », « en Île-de-France », « dans le Val-de-Marne » */
export const COMPANY_LOCATION_IN = locationWithPreposition(
  COMPANY_LOCATION,
  COMPANY_LOCATION_TYPE,
  process.env.NEXT_PUBLIC_COMPANY_LOCATION_PREPOSITION,
)
export const COMPANY_SINCE = process.env.NEXT_PUBLIC_COMPANY_SINCE || '2010'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com'
