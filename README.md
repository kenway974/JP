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
- **Back-office `/admin`** protégé par authentification : leads, créneaux, blog, avis.
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
│  ├─ admin/(dashboard)/     # back-office (leads, créneaux, blog, avis) — protégé
│  ├─ admin/login/            # page de connexion admin (publique)
│  ├─ api/auth/               # login / logout admin
│  └─ api/                   # routes API (leads, booking, reviews, crm, email…)
├─ components/              # composants UI (layout, wizard, avis, blog, trust, seo)
├─ lib/
│  ├─ config.ts              # toute l'identité de l'entreprise (env-driven)
│  ├─ auth.ts                # session admin (JWT signé, cookie httpOnly)
│  ├─ estimation.ts          # logique de calcul des fourchettes de prix
│  ├─ crm/adapters/          # mock, hubspot, pipedrive
│  ├─ calendar/adapters/     # internal, google, calendly
│  ├─ email/                 # envoi SMTP
│  └─ pdf/                   # génération du devis PDF
├─ middleware.ts             # protège /admin/* et /api/admin/*
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

## Base de données
Le projet a besoin d'un Postgres accessible via `DATABASE_URL`. N'importe
quel Postgres managé fonctionne (Supabase, Neon, Railway Postgres, RDS…) ;
le guide ci-dessous utilise **Supabase** (gratuit pour ce volume) car c'est
le plus rapide à mettre en place sans rien installer localement.

1. Créer un projet sur [supabase.com](https://supabase.com/dashboard)
   (ou m'en créer un si tu m'as connecté à ton compte Supabase).
2. Dans le dashboard du projet → **Project Settings → Database → Connect** :
   copier la chaîne **Transaction pooler** (port `6543`, adaptée à une app
   serverless/Next.js) — c'est celle qu'on met dans `DATABASE_URL`.
3. Remplacer `[YOUR-PASSWORD]` dans la chaîne par le mot de passe de la base
   (visible une seule fois à la création du projet ; sinon le régénérer
   depuis **Database → Reset database password**).
4. Coller le résultat dans `.env` :
   ```
   DATABASE_URL="postgresql://postgres.xxxxxxxx:MOT_DE_PASSE@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
5. Créer les tables : `npm run db:push` (utilise `prisma/schema.prisma` — pas
   besoin d'écrire du SQL à la main).
6. (Optionnel) Charger des données de démo : `npm run db:seed`.

> Le schéma applicatif (`Lead`, `Booking`, `Review`, `BlogPost`…) est géré
> uniquement par Prisma. Les fonctionnalités Supabase spécifiques (client
> JS, Row Level Security, Auth Supabase) ne sont **pas utilisées** par ce
> template — la base sert de simple Postgres derrière Prisma. Si tu ajoutes
> plus tard le SDK `@supabase/supabase-js` côté client, pense à activer le
> RLS sur les tables avant d'exposer la clé anonyme.

## Démarrage local
Pré-requis : Node ≥ 20 et une base Postgres (voir ci-dessus).

```bash
npm install
cp .env.example .env        # renseigner DATABASE_URL, SMTP_URL, AUTH_SECRET, ADMIN_*
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

## Authentification admin
`/admin/*` et `/api/admin/*` sont protégés par `middleware.ts` : toute
requête sans session valide est redirigée vers `/admin/login` (ou reçoit un
`401` pour les routes API). La session est un JWT signé (HS256, `jose`),
stocké dans un cookie `httpOnly` + `secure` en production, valable 7 jours.

Identifiants configurés via `.env` (un seul compte admin, volontairement
simple — pas de table `User`) :
- `ADMIN_EMAIL` : l'email de connexion.
- `ADMIN_PASSWORD_HASH` : un **hash bcrypt** du mot de passe (jamais le mot
  de passe en clair).
- `AUTH_SECRET` : clé de signature des sessions.

`.env.example` contient un **exemple fonctionnel prêt à tester** :
- Email : `admin@votre-domaine.fr`
- Mot de passe : `CvcDemo2026!`

Pour générer tes propres identifiants avant de livrer à un client :
```bash
# 1. Un secret de session unique par déploiement
openssl rand -base64 32

# 2. Le hash du mot de passe choisi
node -e "console.log(require('bcryptjs').hashSync('ton-mot-de-passe', 10))"
```
Mettre les résultats dans `AUTH_SECRET` et `ADMIN_PASSWORD_HASH` (variables
d'environnement de production, jamais commit ces valeurs réelles dans `.env`
versionné).

## Sécurité — points à traiter avant mise en production
- Rotation des identifiants admin par défaut (voir ci-dessus) avant toute
  livraison client — `CvcDemo2026!` est un exemple, pas un mot de passe à
  garder.
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
