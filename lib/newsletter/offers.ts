/**
 * Offres « contre inscription » : le visiteur reçoit un contenu utile en échange de son email.
 * Une offre = un guide envoyé par email après confirmation (double opt-in).
 */

export interface NewsletterOffer {
  id: string
  label: string        // libellé court dans le sélecteur
  title: string        // titre du guide
  teaser: string       // phrase qui donne envie
  items: string[]      // contenu réel du guide, envoyé par email
  cta: { label: string; href: string }
}

export const OFFERS: NewsletterOffer[] = [
  {
    id: 'guide-chaudiere',
    label: 'Entretien chaudière',
    title: "Le guide d'entretien de votre chaudière",
    teaser: 'Les contrôles à faire chaque année, et ceux qui ne doivent jamais attendre.',
    items: [
      "Vérifiez la pression de l'installation : elle se situe en général entre 1 et 1,5 bar à froid. Si elle chute souvent, il y a une fuite à faire contrôler.",
      "Purgez les radiateurs qui chauffent mal en bas : de l'air est piégé dans le circuit.",
      "Vérifiez la ventilation et l'évacuation des fumées : une grille bouchée est un danger, pas un détail.",
      "N'attendez pas pour appeler un professionnel en cas d'odeur de gaz, de flamme orange ou de fuite d'eau.",
      "Gardez l'attestation d'entretien annuel : il est obligatoire pour les chaudières gaz et fioul.",
    ],
    cta: { label: 'Demander un devis', href: '/estimation' },
  },
  {
    id: 'aides-renovation',
    label: 'Aides et réductions',
    title: 'Les aides à la rénovation énergétique, par où commencer',
    teaser: 'Ce que vous pouvez cumuler, et les conditions à vérifier avant de signer.',
    items: [
      "MaPrimeRénov' : aide de l'État, sous conditions de revenus, pour certains travaux de rénovation énergétique.",
      "Certificats d'économies d'énergie (CEE) : primes versées selon la nature des travaux, par les fournisseurs d'énergie.",
      "Éco-PTZ : prêt à taux zéro pour financer des travaux éligibles.",
      "Réduction d'impôt pour certains services à la personne, dont l'entretien de la chaudière, sous conditions et si l'entreprise est agréée.",
      "Avant de signer : vérifiez que l'entreprise est certifiée RGE, et faites établir un devis écrit avant tout travaux.",
    ],
    cta: { label: 'Estimer mes travaux', href: '/estimation' },
  },
  {
    id: 'pompe-a-chaleur',
    label: 'Pompe à chaleur',
    title: 'Pompe à chaleur : bien la choisir en 4 questions',
    teaser: 'Les questions à se poser avant de demander un devis, pour comparer sans se faire piéger.',
    items: [
      'Appartement ou maison ? La réponse oriente vers une PAC air/air ou air/eau.',
      "Quels émetteurs avez-vous ? Des radiateurs haute température ne se comportent pas comme un plancher chauffant.",
      "Avez-vous la place pour l'unité extérieure, et le bruit sera-t-il acceptable pour les voisins ?",
      "Quel est le coût réel : installation, entretien et aides déduites, et non seulement le prix d'achat ?",
    ],
    cta: { label: 'Estimer ma pompe à chaleur', href: '/estimation' },
  },
]

export function getOffer(id: string): NewsletterOffer | undefined {
  return OFFERS.find((o) => o.id === id)
}
