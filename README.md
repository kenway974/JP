# Template — Funnel d'acquisition pour entreprises CVC

Site vitrine + tunnel d'acquisition clé en main pour une entreprise de
**Chauffage / Ventilation / Climatisation (CVC)** : landing page, wizard
d'estimation de devis en ligne, prise de rendez-vous, page d'avis clients,
blog, et back-office admin. **100 % configurable via variables
d'environnement** — aucun nom d'entreprise en dur dans le code — pour être
dupliqué rapidement d'un client à l'autre.

- **Wizard d'estimation** : le prospect répond à quelques questions (type de
  bien, service, surface…) et reçoit une **fourchette de prix indicative**
  + un **devis PDF** par email (généré avec PDFKit, sans dépendance externe).
- **Prise de RDV** en ligne, créneaux gérés en interne ou synchronisés avec
  un calendrier externe.
- **Page d'avis clients** avec formulaire de dépôt d'avis.
- **Blog** pour le SEO (articles gérés en base, modifiables depuis l'admin).
- **Back-office `/admin`** : leads, créneaux, blog, avis.
- **CRM agnostique** : adaptateurs interchangeables (mock / HubSpot /
  Pipedrive — Salesforce à implémenter sur le même modèle).
- **Calendrier agnostique** : interne / Google Calendar / Calendly
  (Outlook à implémenter sur le même modèle).
- **Email transactionnel** via SMTP (Brevo, Gmail, ou tout fournisseur SMTP).

## Stack
- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Prisma** + PostgreSQL (leads, créneaux, avis, articles de blog)
- **PDFKit** pour la génération du devis PDF côté serveur
- **Nodemailer** (SMTP) pour l'envoi d'email
- **Zod** + **react-hook-form** pour la validation des formulaires

## Structure
```
├─ app/                    # pages Next.js (App Router)
│  ├─ page.tsx              # landing page
│  ├─ estimation/           # wizard d'estimation + résultat + confirmation
│  ├─ rendez-vous/          # prise de RDV
│  ├─ rappel/                # demande de rappel
│  ├─ avis/                 # avis clients
│  ├─ blog/                  # articles
│  ├─ contact/
│  ├─ admin/                 # back-office (leads, créneaux, blog, avis)
│  └─ api/                   # routes API (leads, booking, reviews, crm, email…)
├─ components/              # composants UI (layout, wizard, avis, blog, trust, seo)
├─ lib/
│  ├─ config.ts              # toute l'identité de l'entreprise (env-driven)
│  ├─ estimation.ts          # logique de calcul des fourchettes de prix
│  ├─ crm/adapters/          # mock, hubspot, pipedrive
│  ├─ calendar/adapters/     # internal, google, calendly
│  ├─ email/                 # envoi SMTP
│  └─ pdf/                   # génération du devis PDF
├─ prisma/                  # schéma + seed de démonstration
├─ Dockerfile · railway.json · .env.example
```

## Personnaliser pour un client
Tout se joue dans `.env` — aucune modification de code nécessaire pour
changer d'entreprise :

```bash
cp .env.example .env
```

Renseigner au minimum :
- `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_COMPANY_SHORT_NAME`
- `NEXT_PUBLIC_COMPANY_PHONE(_RAW)`, `NEXT_PUBLIC_COMPANY_EMAIL`
- `NEXT_PUBLIC_COMPANY_LOCATION`, `NEXT_PUBLIC_COMPANY_SINCE`
- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL` (PostgreSQL)
- `SMTP_URL`, `EMAIL_FROM`, `EMAIL_REPLY_TO`

Le reste (couleurs de marque, services proposés, FAQ, textes de la landing)
se personnalise dans `lib/config.ts` et `app/page.tsx`.

## Démarrage local
Pré-requis : Node ≥ 20, PostgreSQL.

```bash
npm install
cp .env.example .env        # renseigner DATABASE_URL + SMTP_URL au minimum
npm run db:push             # crée le schéma en base
npm run db:seed             # données de démonstration (créneaux, avis, blog)
npm run dev                 # http://localhost:3000
```

### Scripts
| Commande            | Effet                                      |
|----------------------|---------------------------------------------|
| `npm run dev`        | serveur de dev Next.js                      |
| `npm run build`       | build de production                         |
| `npm start`           | lance le build de production                |
| `npm run lint`         | ESLint                                       |
| `npm run db:push`      | applique le schéma Prisma à la base          |
| `npm run db:migrate`   | applique les migrations Prisma (prod)        |
| `npm run db:seed`      | jeu de données de démonstration              |

## Variables d'environnement
Voir `.env.example` pour la liste complète : identité de l'entreprise,
base de données, email (SMTP), CRM (`CRM_PROVIDER=mock|hubspot|pipedrive`),
calendrier (`CALENDAR_PROVIDER=internal|google|calendly`), avis Google,
analytics.

## Déploiement
### Railway (par défaut)
1. Pousser le repo, puis sur Railway : **New Project → Deploy from GitHub**.
2. Railway détecte le `Dockerfile` (cf. `railway.json`).
3. Onglet **Variables** : ajouter toutes les variables de `.env.example`.
4. Déployer.

### Alternatives
Render, Fly.io (Docker identique), Vercel (build Next.js natif), ou tout
hôte Node (`npm install && npm run build && npm start`).

## Sécurité — points à traiter avant mise en production
- **`/admin` n'est actuellement protégé par aucune authentification.** C'est
  la limite la plus importante de ce template : avant de le livrer à un
  client, ajouter une authentification (ex. NextAuth, ou un simple gate par
  mot de passe via middleware Next.js) devant toutes les routes `/admin` et
  `/api/admin/*`.
- Validation systématique des entrées (Zod) côté serveur sur les formulaires
  publics.
- En-têtes de sécurité HTTP (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`) définis dans `next.config.ts`.
- Aucun secret en clair dans le code : tout passe par les variables
  d'environnement.
- `lib/calendar/adapters/google.ts` : l'authentification OAuth2 service
  account n'est pas terminée (`assertion: 'TODO_JWT_HERE'`) — à implémenter
  si le calendrier Google est utilisé en production.

## Conformité légale
Les pages `/mentions-legales` et `/confidentialite` sont déjà génériques et
alimentées par `lib/config.ts`. Avant mise en ligne pour un client : y
ajouter la raison sociale exacte, le SIRET, l'adresse du siège, et faire
relire par un professionnel si nécessaire.

## Licence
MIT — voir `LICENSE`.
