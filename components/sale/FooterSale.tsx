// VERSION SALE — chaque « ❌ #n » renvoie à MAUVAISES-PRATIQUES.md

export function FooterSale() {
  return (
    <footer className="bg-gray-800 text-gray-500 text-[11px] px-4 py-8 text-center space-y-3">
      {/* ❌ #16 Compteur de visiteurs + date de mise à jour périmée */}
      <div className="inline-block bg-black text-green-400 font-mono px-3 py-1 border border-green-700">
        Vous êtes le visiteur n° 001 247
      </div>
      <p>Dernière mise à jour du site : 12/03/2019</p>

      {/* ❌ #17 Liens de remplissage jamais remplacés, pas de mentions légales */}
      <p className="space-x-3">
        <a href="#" className="underline">Lien 1</a>
        <a href="#" className="underline">Lien 2</a>
        <a href="#" className="underline">Lien 3</a>
        <a href="#" className="underline">Plan du site</a>
      </p>

      {/* ❌ #18 Copyright périmé */}
      <p>© Copyright 2019 MonChauff — Tous droits réservés — Site réalisé avec un générateur de site IA</p>
    </footer>
  )
}
