'use client'
import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { SERVICE_LABELS, type ServiceType } from '@/lib/estimation'

interface Realisation {
  id: string
  slug: string
  title: string
  description: string
  serviceType: ServiceType
  city: string | null
  imageUrl: string | null
  imageAlt: string | null
  published: boolean
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  serviceType: 'CHAUFFAGE' as ServiceType,
  city: '',
  imageUrl: '',
  imageAlt: '',
  published: true,
}

const DIACRITICS_REGEX = new RegExp('[̀-ͯ]', 'g')

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminRealisationsPage() {
  const [items, setItems] = useState<Realisation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/realisations')
      .then((r) => r.json())
      .then((d) => setItems(d.realisations || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async () => {
    setError('')
    if (!form.title.trim() || !form.description.trim()) {
      setError('Titre et description sont obligatoires.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/realisations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug: form.slug || slugify(form.title) }),
    })
    setSaving(false)
    if (!res.ok) {
      setError('Impossible d’enregistrer — vérifiez les champs (l’image doit être une URL valide).')
      return
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
    load()
  }

  const togglePublished = async (item: Realisation) => {
    await fetch('/api/admin/realisations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, published: !item.published }),
    })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette réalisation ?')) return
    await fetch('/api/admin/realisations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Réalisations ({items.length})</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-brand-orange text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors flex items-center gap-2"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Annuler' : 'Ajouter un chantier'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Titre</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Remplacement chaudière à Lyon"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prestation</label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value as ServiceType }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ville (optionnel)</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Photo — lien URL (optionnel)</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Ce qui a été fait, le contexte du chantier..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 accent-brand-orange"
              />
              Publier immédiatement sur le site
            </label>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-brand-navy text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Chantier', 'Prestation', 'Ville', 'Statut', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{item.title}</td>
                    <td className="px-4 py-3 text-slate-500">{SERVICE_LABELS[item.serviceType]}</td>
                    <td className="px-4 py-3 text-slate-500">{item.city || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(item)}
                        className={`flex items-center gap-1 text-xs font-medium ${item.published ? 'text-emerald-600' : 'text-slate-400'}`}
                      >
                        {item.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {item.published ? 'Publié' : 'Masqué'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Aucune réalisation pour le moment</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
