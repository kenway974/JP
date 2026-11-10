import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone, Star, CheckCircle, Flame, Snowflake, Wind, Droplets, Zap, Wrench, ShieldCheck, Lock, PiggyBank, Clock, CalendarCheck, FileCheck } from 'lucide-react'
import { TrustBadges } from '@/components/trust/TrustBadges'
import { FAQSchema } from '@/components/seo/SchemaOrg'
import { prisma } from '@/lib/prisma'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { BlogCard } from '@/components/blog/BlogCard'
import { COMPANY_NAME, COMPANY_SHORT_NAME, COMPANY_PHONE, COMPANY_PHONE_RAW, COMPANY_LOCATION, COMPANY_LOCATION_IN, COMPANY_SINCE } from '@/lib/config'

export const metadata: Metadata = {
  // `absolute` : évite que le template du layout ajoute le nom une 2e fois (titre < 65 caractères)
  title: { absolute: `Chauffagiste ${COMPANY_LOCATION_IN} : chauffage, clim, pompe à chaleur | ${COMPANY_SHORT_NAME}` },
  description: `${COMPANY_NAME}, chauffagiste ${COMPANY_LOCATION_IN} : installation, entretien et dépannage de chaudières, pompes à chaleur, climatisation et VMC. Devis gratuit en ligne — réponse sous 24h.`,
}

const SERVICES = [
  { icon: Flame, title: 'Chauffage', items: ['Installation chaudière gaz / fioul', 'Pompe à chaleur (PAC)', 'Plancher chauffant', 'Radiateurs'], color: 'text-red-500', bg: 'bg-red-50' },
  { icon: Snowflake, title: 'Climatisation', items: ['Split mural & multi-split', 'Climatiseur réversible', 'Systèmes VRV/VRF', 'Entretien clim'], color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Wind, title: 'Ventilation (VMC)', items: ['VMC simple flux', 'VMC double flux', 'Extracteurs', 'Puits climatique'], color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { icon: Droplets, title: 'Plomberie', items: ['Canalisations & fuites', 'Sanitaires & salle de bain', 'Chauffe-eau & ECS', 'Adoucisseur d\'eau'], color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Zap, title: 'Électricité', items: ['Tableau électrique', 'Mise aux normes', 'Câblage & prises', 'Éclairage LED'], color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { icon: Wrench, title: 'Entretien & Rénovation', items: ['Contrats d\'entretien', 'Dépannage urgence 24h', 'Rénovation globale', 'Diagnostic énergie'], color: 'text-orange-500', bg: 'bg-orange-50' },
]

const FAQS = [
  { question: `${COMPANY_SHORT_NAME} intervient dans quelle zone géographique ?`, answer: `${COMPANY_NAME} intervient partout ${COMPANY_LOCATION_IN} et dans les environs.` },
  { question: 'Comment obtenir un devis pour mes travaux ?', answer: 'Utilisez notre formulaire d\'estimation en ligne (gratuit, sans engagement) pour obtenir une fourchette de prix en quelques minutes. Un devis définitif et contractuel est établi lors d\'une visite sur site gratuite.' },
  { question: 'Intervenez-vous en urgence le week-end ou la nuit ?', answer: `Oui, ${COMPANY_SHORT_NAME} est disponible 24h/24, 7j/7 pour les urgences (panne de chauffage, fuite, dépannage). Appelez le ${COMPANY_PHONE}.` },
  { question: 'Êtes-vous certifié RGE pour les aides à la rénovation ?', answer: `Oui, ${COMPANY_SHORT_NAME} est certifié RGE (Reconnu Garant de l'Environnement), ce qui vous permet de bénéficier des aides de l'État : MaPrimeRénov', CEE, éco-PTZ pour vos travaux de rénovation énergétique.` },
  { question: 'Quel est le coût d\'un entretien chaudière ?', answer: 'L\'entretien annuel d\'une chaudière gaz est obligatoire (décret 2009-649). Notre tarif indicatif est de 100 à 180€ TTC selon le modèle. Obtenez votre estimation précise via notre formulaire en ligne.' },
  { question: 'Quelle est la différence entre une PAC air/air et air/eau ?', answer: 'La PAC air/air chauffe et refroidit directement l\'air des pièces (idéale pour appartements), tandis que la PAC air/eau transfère la chaleur à un circuit d\'eau pour alimenter radiateurs et eau chaude sanitaire (parfaite pour remplacer une chaudière en maison).' },
]

async function getReviews() {
  try {
    return await prisma.review.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
  } catch {
    return []
  }
}

async function getBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [reviews, posts] = await Promise.all([getReviews(), getBlogPosts()])

  return (
    <>
      <FAQSchema faqs={FAQS} />

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="bg-hero-gradient text-white py-16 md:py-28 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none text-white/[0.04]">
          <Flame className="absolute -top-6 -left-10 h-64 w-64 md:h-96 md:w-96" strokeWidth={1} />
          <Snowflake className="absolute -bottom-16 -right-10 h-64 w-64 md:h-96 md:w-96" strokeWidth={1} />
        </div>
        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            {/* Pré-titre : crédibilité */}
            <p className="inline-flex items-center gap-2 bg-brand-orange/15 text-brand-orange-light text-sm px-3 py-1 rounded-full font-medium mb-5">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Artisan certifié RGE · Depuis {COMPANY_SINCE}
            </p>

            {/* H1 : requête principale (« chauffagiste + zone »), puis les services les plus recherchés */}
            <h1 className="font-heading font-bold leading-tight mb-5">
              <span className="block text-4xl md:text-5xl lg:text-6xl">
                Chauffagiste <span className="text-brand-orange">{COMPANY_LOCATION_IN}</span>
              </span>
              <span className="block mt-3 text-xl md:text-2xl lg:text-3xl text-slate-200 font-semibold">
                Chauffage, climatisation et pompe à chaleur
              </span>
            </h1>

            {/* Sous-titre : la promesse, en une phrase */}
            <p className="text-lg md:text-xl text-slate-300 mb-6 leading-relaxed">
              Installation, entretien et dépannage de vos équipements, du devis jusqu&apos;à la mise en service.
            </p>

            {/* Arguments clés : scannables en un coup d'œil */}
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: FileCheck, text: 'Devis gratuit en ligne' },
                { icon: Clock, text: 'Intervention sous 24h' },
                { icon: CalendarCheck, text: 'Disponible 7j/7' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-white font-medium">
                  <Icon className="h-5 w-5 text-brand-orange flex-shrink-0" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>

            {/* Actions : 1 principale, 1 secondaire, 1 tertiaire */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/estimation"
                className="btn-primary justify-center text-lg px-8 py-4 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
              >
                Estimation gratuite <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <a
                href={`tel:${COMPANY_PHONE_RAW}`}
                className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
              >
                <Phone className="h-5 w-5 text-brand-orange" aria-hidden="true" />
                {COMPANY_PHONE}
              </a>
            </div>
            <Link
              href="/simulateur-aides"
              className="mt-4 inline-flex items-center gap-2 py-2 text-sm text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-500 hover:decoration-white transition-colors"
            >
              <PiggyBank className="h-4 w-4 text-brand-orange-light" aria-hidden="true" />
              Simuler mes aides et ma réduction d&apos;impôt
            </Link>

            {/* Réassurance */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-8 pt-6 border-t border-white/10 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span><strong className="text-white">4.9/5</strong> · +50 avis</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                Certifié RGE
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                Sans engagement
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Badges de confiance ─────────────────────────────────── */}
      <section className="py-12 bg-slate-50">
        <div className="container-site">
          <TrustBadges />
        </div>
      </section>

      {/* ─── Services ────────────────────────────────────────────── */}
      <section className="section-padding" id="services">
        <div className="container-site">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-navy mb-4">
              Nos domaines d&apos;expertise
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Une seule entreprise pour tous vos besoins en génie climatique, plomberie et électricité {COMPANY_LOCATION_IN}.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, items, color, bg }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="font-heading font-bold text-brand-navy text-xl mb-3">{title}</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-600 text-sm">
                      <CheckCircle className="h-4 w-4 text-brand-orange flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/estimation"
                  className="mt-5 inline-flex items-center gap-2 text-brand-orange font-medium text-sm hover:gap-3 transition-all"
                >
                  Obtenir un devis <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA tunnel ──────────────────────────────────────────── */}
      <section className="bg-cta-gradient py-16 md:py-20">
        <div className="container-site text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Obtenez votre estimation en 2 minutes
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            Remplissez notre formulaire en ligne. Recevez une fourchette de prix indicative + un guide pratique gratuit par email.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/estimation"
              className="bg-white text-brand-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-colors text-lg shadow-lg inline-flex items-center gap-2"
            >
              Estimer mes travaux gratuitement <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href={`tel:${COMPANY_PHONE_RAW}`}
              className="bg-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-colors text-lg inline-flex items-center gap-2"
            >
              <Phone className="h-5 w-5" /> Appeler directement
            </a>
          </div>
        </div>
      </section>

      {/* ─── À propos / E-E-A-T ────────────────────────────────────────── */}
      <section className="section-padding bg-slate-50" id="expertise">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-navy mb-6">
                15+ ans d&apos;expérience au service des clients
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {COMPANY_NAME} exerce le métier de chauffagiste depuis {COMPANY_SINCE}.
                Fort de cette expérience sur le terrain, nous proposons
                un service de qualité, personnalisé et transparent, sans intermédiaire.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Nous intervenons aussi bien chez les particuliers que pour de grands groupes, avec le même
                soin du détail et le même engagement : un travail bien fait, expliqué et garanti.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '15+', label: 'Années d\'expérience' },
                  { value: '500+', label: 'Clients satisfaits' },
                  { value: '24h/7j', label: 'Disponibilité' },
                  { value: '100%', label: COMPANY_LOCATION },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-brand-orange">{value}</div>
                    <div className="text-sm text-slate-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { emoji: '🎯', title: 'Devis gratuit et transparent', desc: 'Pas de mauvaise surprise : chaque devis est détaillé et expliqué avant le démarrage des travaux.' },
                { emoji: '⚡', title: 'Réactivité garantie', desc: 'Intervention sous 24h pour les projets planifiés, immédiate pour les urgences.' },
                { emoji: '🔧', title: 'Travail soigné et garanti', desc: 'Respect des normes en vigueur, finitions impeccables, garantie sur toutes nos interventions.' },
                { emoji: '📱', title: 'Suivi personnalisé', desc: 'Un seul interlocuteur du devis à la réception des travaux. Toujours joignable.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <h3 className="font-semibold text-brand-navy mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Avis clients ──────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="section-padding" id="avis">
          <div className="container-site">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />)}
                <span className="font-bold text-brand-navy text-xl ml-2">4.9/5</span>
              </div>
              <h2 className="text-3xl font-heading font-bold text-brand-navy mb-3">Ce que disent nos clients</h2>
              <p className="text-slate-500">Avis vérifiés de clients ayant fait appel à {COMPANY_SHORT_NAME} {COMPANY_LOCATION_IN}.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {reviews.map((r) => (
                <ReviewCard key={r.id} {...r} createdAt={r.createdAt} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/avis" className="btn-outline">
                Voir tous les avis <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ───────────────────────────────────────────────────── */}
      <section className="section-padding bg-slate-50" id="faq">
        <div className="container-site">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-brand-navy mb-2 text-center">Questions fréquentes</h2>
            <p className="text-slate-500 text-center mb-10">Tout ce que vous devez savoir avant de faire appel à un chauffagiste.</p>
            <div className="space-y-4">
              {FAQS.map(({ question, answer }) => (
                <details key={question} className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-brand-navy select-none">
                    {question}
                    <span className="text-brand-orange group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">{answer}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Blog ─────────────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <section className="section-padding" id="blog">
          <div className="container-site">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-heading font-bold text-brand-navy mb-3">Conseils & guides pratiques</h2>
              <p className="text-slate-500">Des articles rédigés par des professionnels pour vous aider à bien entretenir vos équipements.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {posts.map((p) => <BlogCard key={p.id} {...p} publishedAt={p.publishedAt} />)}
            </div>
            <div className="text-center">
              <Link href="/blog" className="btn-outline">
                Voir tous les articles <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA final ───────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-16 text-center">
        <div className="container-site">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à démarrer votre projet ?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Estimation gratuite en ligne · Réponse sous 24h · Sans engagement
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/estimation" className="btn-primary text-lg px-8 py-4">
              Estimation gratuite <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/rendez-vous" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg inline-flex items-center gap-2">
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
