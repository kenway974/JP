import { MapPin } from 'lucide-react'
import { SERVICE_LABELS, type ServiceType } from '@/lib/estimation'

interface RealisationCardProps {
  title: string
  description: string
  serviceType: ServiceType
  city?: string | null
  imageUrl?: string | null
  imageAlt?: string | null
}

export function RealisationCard({ title, description, serviceType, city, imageUrl, imageAlt }: RealisationCardProps) {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all group">
      <div className="relative h-48 bg-gradient-to-br from-brand-navy to-brand-navy-light overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={imageAlt || title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-white text-6xl">🔧</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-brand-orange text-white text-xs px-2 py-1 rounded-full font-medium">{SERVICE_LABELS[serviceType]}</span>
        </div>
      </div>
      <div className="p-5">
        {city && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <MapPin className="h-3.5 w-3.5" />
            {city}
          </div>
        )}
        <h3 className="font-heading font-bold text-brand-navy mb-2">{title}</h3>
        <p className="text-slate-500 text-sm line-clamp-3">{description}</p>
      </div>
    </article>
  )
}
