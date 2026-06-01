import PDFDocument from 'pdfkit'

export interface QuotePDFProps {
  firstName: string
  serviceType: string
  housingType: string
  surface?: number
  city: string
  estimateMin: number
  estimateMax: number
  details: string[]
  prospectId: string
  date: string
}

const NAVY  = '#1a2744'
const ORANGE = '#f97316'
const SLATE  = '#64748b'
const LIGHT  = '#f8fafc'
const AMBER_BG = '#fef3c7'
const AMBER_TEXT = '#92400e'
const GREEN_BG = '#f0fdf4'
const GREEN_TEXT = '#166534'

function fmt(n: number) {
  return n.toLocaleString('fr-FR') + ' €'
}

export async function renderQuotePDF(props: QuotePDFProps): Promise<Buffer> {
  const {
    firstName, serviceType, housingType, surface, city,
    estimateMin, estimateMax, details, prospectId, date,
  } = props

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Devis indicatif JP Clim — ${firstName}`, Author: 'JP Clim Chauffagiste' } })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = doc.page.width - 100 // largeur utile (marges 50 de chaque côté)
    const L = 50  // marge gauche

    // ── EN-TÊTE ────────────────────────────────────────────────────────────
    doc.rect(L, 40, W, 70).fill(NAVY)

    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
       .text('JP Clim Chauffagiste', L + 16, 52)
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
       .text('Chauffage · Climatisation · VMC · Plomberie · Électricité', L + 16, 74)
       .text('Île-de-France — 06 52 49 52 90', L + 16, 86)

    doc.fillColor(ORANGE).fontSize(14).font('Helvetica-Bold')
       .text('DEVIS INDICATIF', L, 52, { align: 'right', width: W })
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
       .text(`Date : ${date}`, L, 74, { align: 'right', width: W })
       .text(`Réf. : ${prospectId}`, L, 86, { align: 'right', width: W })

    doc.y = 130

    // ── AVERTISSEMENT ──────────────────────────────────────────────────────
    const warnY = doc.y
    doc.rect(L, warnY, W, 44).fill(AMBER_BG)
    doc.rect(L, warnY, 3, 44).fill('#f59e0b')
    doc.fillColor(AMBER_TEXT).fontSize(8).font('Helvetica')
       .text(
         '⚠️  CE DOCUMENT EST UN DEVIS INDICATIF ET NON CONTRACTUEL. Le tarif réel peut différer selon les ' +
         'particularités techniques du chantier, l\'accessibilité, l\'état des installations et les matériaux choisis. ' +
         'Seule une visite sur site permet d\'établir un devis définitif.',
         L + 10, warnY + 8, { width: W - 20 }
       )
    doc.y = warnY + 52

    // ── SECTION TITRE ──────────────────────────────────────────────────────
    function sectionTitle(title: string) {
      const y = doc.y + 8
      doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text(title, L, y)
      doc.moveTo(L, doc.y + 2).lineTo(L + W, doc.y + 2).strokeColor('#e2e8f0').lineWidth(1).stroke()
      doc.y = doc.y + 8
    }

    // ── TABLEAU INFOS ──────────────────────────────────────────────────────
    sectionTitle('Informations de la demande')

    const rows = [
      ['Client', firstName],
      ['Ville', city],
      ['Type de prestation', serviceType],
      ['Type de logement', housingType],
      ['Surface', surface ? `${surface} m²` : 'Non renseigné'],
    ]
    const rowH = 20
    const col1W = W * 0.55

    // header
    doc.rect(L, doc.y, W, rowH).fill(NAVY)
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
       .text('Champ', L + 8, doc.y + 5, { width: col1W })
    doc.text('Valeur', L + col1W + 8, doc.y - rowH + 5, { width: W - col1W })
    doc.y = doc.y

    rows.forEach(([label, value], i) => {
      const rowY = doc.y
      if (i % 2 === 1) doc.rect(L, rowY, W, rowH).fill('#f8fafc')
      doc.rect(L, rowY, W, rowH).strokeColor('#e2e8f0').lineWidth(0.5).stroke()
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica')
         .text(label, L + 8, rowY + 6, { width: col1W })
      doc.text(value, L + col1W + 8, rowY + 6, { width: W - col1W })
      doc.y = rowY + rowH
    })

    doc.y += 4

    // ── ESTIMATION ─────────────────────────────────────────────────────────
    sectionTitle('Estimation indicative')

    const estY = doc.y
    doc.rect(L, estY, W, 68).fill('#eff6ff')
    doc.rect(L, estY, 4, 68).fill(NAVY)

    doc.fillColor(SLATE).fontSize(9).font('Helvetica')
       .text('Fourchette estimée (TTC, main d\'œuvre + matériaux courants) :', L + 16, estY + 10, { width: W - 20 })
    doc.fillColor(NAVY).fontSize(22).font('Helvetica-Bold')
       .text(`${fmt(estimateMin)}  –  ${fmt(estimateMax)}`, L + 16, estY + 24, { width: W - 20 })
    doc.fillColor(SLATE).fontSize(8).font('Helvetica')
       .text(`Facteurs pris en compte : ${details.join(' · ')}`, L + 16, estY + 52, { width: W - 20 })

    doc.y = estY + 76

    // ── GUIDE PRATIQUE ─────────────────────────────────────────────────────
    sectionTitle('🎁 Votre guide pratique offert')

    function guideCard(title: string, items: string[]) {
      const cardY = doc.y
      const textH = 16 + items.length * 14
      doc.rect(L, cardY, W, textH).fill(GREEN_BG)
      doc.rect(L, cardY, 3, textH).fill('#22c55e')
      doc.fillColor(GREEN_TEXT).fontSize(9.5).font('Helvetica-Bold')
         .text(title, L + 12, cardY + 8, { width: W - 20 })
      items.forEach((item, i) => {
        doc.fillColor('#374151').fontSize(8.5).font('Helvetica')
           .text(`• ${item}`, L + 20, cardY + 22 + i * 14, { width: W - 30 })
      })
      doc.y = cardY + textH + 6
    }

    guideCard('✅ Entretien courant (gestes à faire vous-même)', [
      'Nettoyez les filtres de votre climatisation tous les 2 mois (eau tiède, brosse douce)',
      'Purgez vos radiateurs en début de saison jusqu\'au sifflement, puis refermez dès que l\'eau coule',
      'Vérifiez mensuellement que la pression de votre chaudière est entre 1 et 1,5 bar',
      'Nettoyez les bouches VMC (désserrez, rincez à l\'eau tiède, laissez sécher)',
    ])

    guideCard('⚡ 5 réglages pour économiser jusqu\'à 20 % d\'énergie', [
      'Réduisez de 1°C la nuit et dans les pièces inutilisées (économie : ~7 % par degré)',
      'Programmez votre chauffage : 19°C en journée, 17°C la nuit, 14°C en absence prolongée',
      'Ne couvrez pas vos radiateurs — les meubles trop proches réduisent l\'efficacité de 30 %',
      'Ventilez 10 min le matin plutôt que fenêtres entrouvertes (perte thermique ×5)',
      'Installez des robinets thermostatiques pour réguler pièce par pièce',
    ])

    guideCard('🚨 Signaux d\'alerte : appelez sans attendre', [
      'Odeur de gaz ou brûlé → coupez le gaz et appelez immédiatement',
      'Chaudière qui clignote ou s\'éteint plusieurs fois par semaine → panne imminente',
      'Bruit de claquement dans les canalisations → coup de bélier, risque de fuite',
      'Climatisation qui ne refroidit plus malgré le nettoyage → fuite de fluide frigorigène',
      'Moisissures sur les murs → VMC insuffisante, à vérifier de toute urgence',
    ])

    // ── CTA ────────────────────────────────────────────────────────────────
    const ctaY = doc.y + 4
    doc.rect(L, ctaY, W, 44).fill(ORANGE)
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
       .text('Prêt pour un devis réel sur site ? Appelez le 06 52 49 52 90', L + 10, ctaY + 8, { align: 'center', width: W - 20 })
    doc.fillColor('#ffedd5').fontSize(8.5).font('Helvetica')
       .text('Ou prenez rendez-vous en ligne sur jpclimchauffagiste.com — Gratuit, sans engagement', L + 10, ctaY + 26, { align: 'center', width: W - 20 })

    // ── PIED DE PAGE ───────────────────────────────────────────────────────
    const footerY = doc.page.height - 50
    doc.moveTo(L, footerY).lineTo(L + W, footerY).strokeColor('#e2e8f0').lineWidth(0.5).stroke()
    doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
       .text(
         `JP Clim Chauffagiste · Île-de-France · 06 52 49 52 90 · jpclim.chauffagiste@gmail.com\nDocument indicatif non contractuel · Réf. ${prospectId} · ${date}`,
         L, footerY + 6, { align: 'center', width: W }
       )

    doc.end()
  })
}
