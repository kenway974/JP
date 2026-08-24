'use client'
import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, Save } from 'lucide-react'
import { SERVICE_LABELS } from '@/lib/estimation'

interface BasePrice {
  serviceType: string
  label: string
  min: number
  max: number
}

interface Factor {
  key: string
  label: string
  minMultiplier: number
  maxMultiplier: number
  active: boolean
}

export default function AdminEstimationPage() {
  const [basePrices, setBasePrices] = useState<BasePrice[]>([])
  const [factors, setFactors] = useState<Factor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/estimation')
      .then((r) => r.json())
      .then((d) => {
        setBasePrices(d.basePrices || [])
        setFactors(d.factors || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const updateBasePrice = (serviceType: string, field: 'min' | 'max', value: number) => {
    setBasePrices((prev) => prev.map((b) => (b.serviceType === serviceType ? { ...b, [field]: value } : b)))
  }

  const updateFactor = (key: string, field: 'minMultiplier' | 'maxMultiplier' | 'active', value: number | boolean) => {
    setFactors((prev) => prev.map((f) => (f.key === key ? { ...f, [field]: value } : f)))
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/admin/estimation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basePrices, factors }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Estimateur</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-orange text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Enregistré' : 'Enregistrer'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-1">Prix de base par prestation</h2>
        <p className="text-sm text-slate-500 mb-4">La fourchette de départ avant application des critères ci-dessous.</p>
        <div className="space-y-3">
          {basePrices.map((b) => (
            <div key={b.serviceType} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-700 sm:w-64 flex-shrink-0">{SERVICE_LABELS[b.serviceType as keyof typeof SERVICE_LABELS] || b.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={b.min}
                  onChange={(e) => updateBasePrice(b.serviceType, 'min', Number(e.target.value))}
                  className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                />
                <span className="text-slate-400 text-sm">à</span>
                <input
                  type="number"
                  value={b.max}
                  onChange={(e) => updateBasePrice(b.serviceType, 'max', Number(e.target.value))}
                  className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                />
                <span className="text-slate-400 text-sm">€</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-1">Critères d&apos;ajustement</h2>
        <p className="text-sm text-slate-500 mb-4">
          Chaque critère décale le prix estimé (moyenne des deux valeurs). 1.10 = plutôt +10 %, 0.90 = plutôt −10 %. Désactiver un critère annule son effet sans le retirer du site.
        </p>
        <div className="space-y-3">
          {factors.map((f) => (
            <div key={f.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2 border-b border-slate-50 last:border-0">
              <label className="flex items-center gap-2 sm:w-64 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={f.active}
                  onChange={(e) => updateFactor(f.key, 'active', e.target.checked)}
                  className="h-4 w-4 accent-brand-orange"
                />
                <span className={`text-sm ${f.active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{f.label}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={f.minMultiplier}
                  onChange={(e) => updateFactor(f.key, 'minMultiplier', Number(e.target.value))}
                  disabled={!f.active}
                  className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-slate-50 disabled:text-slate-300"
                />
                <span className="text-slate-400 text-sm">à</span>
                <input
                  type="number"
                  step="0.01"
                  value={f.maxMultiplier}
                  onChange={(e) => updateFactor(f.key, 'maxMultiplier', Number(e.target.value))}
                  disabled={!f.active}
                  className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-slate-50 disabled:text-slate-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
