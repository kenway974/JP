import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { EstimationFactorImpact } from '@/lib/estimation'

const MAX_SCALE = 50 // % d'impact qui remplit entièrement une moitié de la jauge

export function EstimationGauge({ label, impactPercent, direction }: EstimationFactorImpact) {
  const fillWidth = Math.min(Math.abs(impactPercent) / MAX_SCALE, 1) * 50
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus
  const textColor = direction === 'up' ? 'text-brand-orange' : direction === 'down' ? 'text-emerald-600' : 'text-slate-400'
  const barColor = direction === 'up' ? 'bg-brand-orange' : direction === 'down' ? 'bg-emerald-500' : 'bg-slate-300'

  return (
    <div className="flex items-center gap-3">
      <Icon className={`h-4 w-4 flex-shrink-0 ${textColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-sm text-slate-700 truncate">{label}</span>
          <span className={`text-xs font-semibold flex-shrink-0 ${textColor}`}>
            {impactPercent > 0 ? '+' : ''}{impactPercent}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
          {direction === 'up' && (
            <div className={`absolute inset-y-0 left-1/2 ${barColor} rounded-r-full`} style={{ width: `${fillWidth}%` }} />
          )}
          {direction === 'down' && (
            <div className={`absolute inset-y-0 right-1/2 ${barColor} rounded-l-full`} style={{ width: `${fillWidth}%` }} />
          )}
        </div>
      </div>
    </div>
  )
}
