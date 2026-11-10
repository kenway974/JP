# Version « sale » — catalogue des mauvaises pratiques visibles

Branche **`version-sale`** : le site tel que le ferait une entreprise qui génère son site avec un prompt vite fait,
sans notion de web. Ne jamais fusionner dans `main`.

Chaque erreur est **visible à l'écran** (pour des captures) et repérée dans le code par un commentaire `❌ #n`.

**Astuces de capture**
- `/` : page d'accueil avec popups (newsletter + cookies + chat ouverts en même temps).
- `/?sanspopup` : même page sans les popups, pour capturer le reste.
- `/contact?sanspopup` puis cliquer sur « Soumettre » : fait apparaître le message d'erreur.
- Pour comparer, la version propre est sur `main`.

## Page d'accueil — en-tête

| # | Erreur visible | Pourquoi ça coûte des clients | Version propre |
|---|---|---|---|
| 1 | Bandeau rouge clignotant « PROMO -50% SUR TOUT !!! » | Fait arnaque, distrait, aucune offre réelle | Badge sobre « Artisan certifié RGE · Depuis 2010 » |
| 2 | Logo en texte avec police fantaisie, slogan creux, pas de téléphone | Pas mémorisable, pas professionnel ; le visiteur pressé ne peut pas appeler | Logo + numéro cliquable dans le header |
| 3 | Menu à 11 entrées sur 3 lignes, aucun bouton d'action | Paralysie du choix, le contenu utile est repoussé sous l'écran | 5 entrées + bouton « Estimation gratuite » mis en avant |
| 4 | Onglet du navigateur : « Home » | Rien ne dit qui vous êtes, ni dans l'onglet ni dans Google | « Chauffagiste à Paris : chauffage, clim, pompe à chaleur » |

## Page d'accueil — hero

| # | Erreur visible | Pourquoi ça coûte des clients | Version propre |
|---|---|---|---|
| 5 | H1 « Bienvenue sur notre site internet ! » en police Comic | Ni le métier ni la ville : le visiteur ne sait pas s'il est au bon endroit, Google non plus | H1 « Chauffagiste à Paris » + services |
| 6 | Pavé de 8 lignes de texte d'IA, gris clair sur blanc | Illisible (contraste), personne ne lit, aucune info concrète | Une phrase de promesse + 3 arguments à puces |
| 7 | Image cassée `IMG_20190312_hero-FINAL-v2(1).jpg` | Site perçu comme abandonné | Pas d'image inutile, ou une vraie photo optimisée |
| 8 | 5 boutons colorés de même taille : « En savoir plus », « Découvrir », « Cliquez ici »… | Aucun chemin clair, libellés qui ne disent pas ce qui se passe | 1 bouton principal, 1 secondaire, 1 lien discret |

## Page d'accueil — contenu

| # | Erreur visible | Pourquoi ça coûte des clients | Version propre |
|---|---|---|---|
| 9 | « [Insérer ici le nom de l'entreprise] » + lorem ipsum | Le prompt a été copié sans relecture : crédibilité zéro | Texte relu et spécifique à l'entreprise |
| 10 | Badges « N°1 en France », « Meilleur prix garanti », « Certifié » (certifié quoi ?) | Promesses invérifiables, voire illégales (pratique commerciale trompeuse) | Preuves vérifiables : RGE, note Google, années d'expérience |
| 11 | 12 services en vrac, jargon (VRV/VRF, CESI, loi d'eau), texte de 9px, pas de bouton | Le client ne comprend pas, ne lit pas, ne peut pas agir | 6 familles de services claires + « Obtenir un devis » |
| 12 | Carrousel vide « Image 1/8 — photo à ajouter » | Aucune réalisation montrée = aucune preuve | Vraies photos de chantiers |
| 13 | 3 avis identiques, même auteur, même date, « 5/5 (3 avis) » | Faux avis évidents : détruit la confiance (et sanctionnable) | Avis Google réels, variés, datés |
| 14 | Téléphone non cliquable, horaires restreints, adresse Gmail, réponse « sous 7 à 10 jours » | Freins au contact à chaque étape | Numéro `tel:` cliquable partout, email pro, réponse sous 24h |
| 15 | Bloc « 🚧 SITE EN CONSTRUCTION 🚧 » | Signale un site inachevé | Publier seulement ce qui est prêt |

## Pied de page

| # | Erreur visible | Pourquoi ça coûte des clients | Version propre |
|---|---|---|---|
| 16 | Compteur « Vous êtes le visiteur n° 001 247 » + « mise à jour 12/03/2019 » | Look années 2000, site qui semble abandonné | Rien de tout ça |
| 17 | Liens « Lien 1 / Lien 2 / Lien 3 », pas de mentions légales | Liens morts ; mentions légales obligatoires pour un pro | Liens utiles + mentions légales + confidentialité |
| 18 | « © Copyright 2019 » | Signal d'abandon | Année à jour |

## Popups (toutes les pages)

| # | Erreur visible | Pourquoi ça coûte des clients | Version propre |
|---|---|---|---|
| 19 | Popup newsletter « NE PARTEZ PAS !!! » dès l'arrivée | Bloque la lecture avant même qu'on sache ce que fait l'entreprise | Pas de popup à l'arrivée |
| 20 | Croix de fermeture minuscule et grise + « Non merci, je n'aime pas faire des économies » | Culpabilisation (« confirmshaming »), frustration | Fermeture évidente, ton respectueux |
| 21 | Cookies : gros « TOUT ACCEPTER », « paramétrer » minuscule, pas de « Refuser » | Non conforme RGPD/CNIL (refuser doit être aussi simple qu'accepter) | « Accepter » et « Refuser » au même niveau |
| 22 | Widget de chat avec bulle et badge « 3 » qui recouvre le contenu | Masque les boutons, fausse notification | Pas de chat, ou discret et réellement suivi |

Note : la popup newsletter a aussi une case précochée (même problème que #28).

## Page contact

| # | Erreur visible | Pourquoi ça coûte des clients | Version propre |
|---|---|---|---|
| 23 | 14 champs obligatoires, dont date de naissance et revenu fiscal | Chaque champ en plus fait fuir ; données sans rapport = méfiance (et contraire au RGPD) | 3 à 5 champs : nom, téléphone, email, message |
| 24 | Titre « Formulaire », aucun téléphone proposé | Pas d'alternative pour ceux qui préfèrent appeler | Coordonnées cliquables à côté du formulaire |
| 25 | « ERREUR : formulaire invalide » sans dire quel champ | Le visiteur abandonne | Message sous le champ concerné |
| 26 | Pas de libellés, seulement des placeholders gris clair | On ne sait plus quel champ on remplit dès qu'on tape ; illisible | Libellés visibles au-dessus des champs |
| 27 | Captcha maison barré et illisible | Barrière inutile | Protection anti-spam invisible |
| 28 | Cases précochées : newsletter + données transmises aux partenaires | Consentement non valable (RGPD), méfiance | Cases décochées, ou rien |
| 29 | « Effacer » avant « Soumettre », mêmes boutons gris | Risque d'effacer tout son formulaire ; bouton d'envoi invisible | Un seul bouton d'envoi, coloré, libellé clair |
| 30 | « Délai de 7 à 10 jours ouvrés. Aucune demande par téléphone ne sera traitée. » | Le client part chez le concurrent | « Réponse sous 24h » |
