'use client'
import { useState } from 'react'

// VERSION SALE — formulaire de contact « généré vite fait ».
// Chaque « ❌ #n » renvoie à MAUVAISES-PRATIQUES.md.

// ❌ #23 Formulaire de 14 champs, tous obligatoires, dont des données sans rapport (date de naissance, revenus…)
const FIELDS = [
  'Civilité', 'Nom', 'Prénom', 'Date de naissance', 'Adresse', 'Complément d\'adresse', 'Code postal',
  'Ville', 'Pays', 'Téléphone fixe', 'Téléphone portable', 'Email', 'Confirmez votre email',
  'Revenu fiscal de référence',
]

export default function ContactPageSale() {
  const [error, setError] = useState(false)

  return (
    <div className="px-4 py-10 max-w-xl mx-auto">
      {/* ❌ #24 Titre qui ne dit rien et aucune alternative au formulaire (pas de téléphone) */}
      <h1 className="text-3xl font-bold text-purple-700 mb-2" style={{ fontFamily: 'var(--font-comic), cursive' }}>
        Formulaire
      </h1>
      <p className="text-xs text-gray-400 mb-6">Tous les champs sont obligatoires (*).</p>

      {/* ❌ #25 Message d'erreur vague, en haut, sans dire quel champ pose problème */}
      {error && (
        <div className="bg-red-600 text-white text-sm font-bold p-3 mb-4">
          ERREUR : formulaire invalide. Veuillez réessayer.
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); setError(true) }}
        className="space-y-2"
      >
        {/* ❌ #26 Champs sans libellé : le texte d'aide disparaît dès qu'on tape */}
        {FIELDS.map((f) => (
          <input key={f} placeholder={`${f} *`} className="w-full border border-gray-200 px-2 py-1 text-xs placeholder:text-gray-300" />
        ))}

        <select className="w-full border border-gray-200 px-2 py-1 text-xs text-gray-300" defaultValue="">
          <option value="" disabled>Comment nous avez-vous connu ? *</option>
          <option>Bouche à oreille</option>
          <option>Internet</option>
          <option>Autre</option>
        </select>

        <textarea placeholder="Votre message (minimum 200 caractères) *" rows={3} className="w-full border border-gray-200 px-2 py-1 text-xs placeholder:text-gray-300" />

        {/* ❌ #27 Captcha illisible fait maison */}
        <div className="flex items-center gap-2">
          <span className="bg-gray-200 px-3 py-1 font-mono italic line-through text-gray-500 tracking-[0.3em] select-none">
            x7gK2p
          </span>
          <input placeholder="Recopiez le code *" className="flex-1 border border-gray-200 px-2 py-1 text-xs placeholder:text-gray-300" />
        </div>

        {/* ❌ #28 Cases précochées : newsletter + revente aux partenaires */}
        <label className="flex items-start gap-2 text-[10px] text-gray-400">
          <input type="checkbox" defaultChecked /> Je souhaite recevoir la newsletter
        </label>
        <label className="flex items-start gap-2 text-[10px] text-gray-400">
          <input type="checkbox" defaultChecked /> J&apos;accepte que mes données soient transmises à des partenaires commerciaux
        </label>

        {/* ❌ #29 « Effacer » placé avant « Envoyer », même style ; bouton d'envoi gris et vague */}
        <div className="flex gap-2 pt-2">
          <button type="reset" className="bg-gray-300 text-gray-500 px-4 py-2 text-sm">Effacer</button>
          <button type="submit" className="bg-gray-300 text-gray-500 px-4 py-2 text-sm">Soumettre</button>
        </div>
      </form>

      {/* ❌ #30 Délai de réponse décourageant */}
      <p className="text-[10px] text-gray-400 mt-6">
        Votre demande sera traitée dans un délai de 7 à 10 jours ouvrés. Aucune demande par téléphone ne sera traitée.
      </p>
    </div>
  )
}
