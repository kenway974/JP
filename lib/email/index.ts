import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let _transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (_transporter) return _transporter

  const smtpUrl = process.env.SMTP_URL
  if (!smtpUrl) {
    throw new Error('Variable d\'environnement SMTP_URL manquante.')
  }

  _transporter = nodemailer.createTransport(smtpUrl)
  return _transporter
}

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Chauffagiste'
const COMPANY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE || 'XX XX XX XX XX'
const COMPANY_PHONE_RAW = process.env.NEXT_PUBLIC_COMPANY_PHONE_RAW || 'XXXXXXXXXX'
const COMPANY_EMAIL = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contact@example.com'
const COMPANY_LOCATION = process.env.NEXT_PUBLIC_COMPANY_LOCATION || 'Votre ville'
const COMPANY_SINCE = process.env.NEXT_PUBLIC_COMPANY_SINCE || '2010'
const FROM = process.env.EMAIL_FROM || `${COMPANY_NAME} <noreply@example.com>`
const REPLY_TO = process.env.EMAIL_REPLY_TO || COMPANY_EMAIL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com'

export interface SendQuoteEmailParams {
  to: string
  firstName: string
  serviceType: string
  estimateMin: number
  estimateMax: number
  lowFactors: string[]
  highFactors: string[]
  pdfBase64: string
  prospectId: string
}

export async function sendQuoteEmail(params: SendQuoteEmailParams) {
  const { to, firstName, serviceType, estimateMin, estimateMax, lowFactors, highFactors, pdfBase64, prospectId } = params

  const trackingPixelUrl = `${SITE_URL}/api/crm/track?id=${prospectId}&event=QUOTE_EMAIL_OPENED`

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre devis indicatif — ${COMPANY_NAME}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1a2744; padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .header p { color: #94a3b8; margin: 8px 0 0; }
    .body { padding: 32px; }
    .estimate-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
    .estimate-box .amount { font-size: 32px; font-weight: bold; color: #1a2744; }
    .estimate-box .disclaimer { font-size: 13px; color: #64748b; margin-top: 8px; }
    .range-explain { margin: 0 0 24px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .range-explain .re-title { background: #1a2744; color: #fff; padding: 10px 16px; font-size: 13px; font-weight: bold; }
    .re-low { background: #f0fdf4; padding: 14px 16px; border-bottom: 1px solid #e2e8f0; }
    .re-high { background: #fff7ed; padding: 14px 16px; }
    .re-label { font-size: 12px; font-weight: bold; margin-bottom: 6px; }
    .re-low .re-label { color: #166534; }
    .re-high .re-label { color: #9a3412; }
    .re-low ul, .re-high ul { margin: 0; padding-left: 18px; }
    .re-low li, .re-high li { font-size: 12px; color: #374151; margin-bottom: 3px; }
    .cta-btn { display: inline-block; background: #f97316; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 8px; }
    .cta-secondary { display: inline-block; background: #1a2744; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 8px; }
    .guide-section { background: #eff6ff; border-left: 4px solid #f97316; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    .tip { display: flex; align-items: flex-start; margin: 12px 0; }
    .tip-icon { font-size: 20px; margin-right: 12px; flex-shrink: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${COMPANY_NAME}</h1>
      <p>Votre devis indicatif est prêt ✓</p>
    </div>
    <div class="body">
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>Merci pour votre demande de devis concernant : <strong>${serviceType}</strong>.</p>
      <p>Voici votre estimation indicative en pièce jointe (PDF), ainsi que quelques conseils pratiques gratuits.</p>

      <div class="estimate-box">
        <div style="font-size: 14px; color: #64748b; margin-bottom: 8px;">Estimation indicative</div>
        <div class="amount">${estimateMin.toLocaleString('fr-FR')} € – ${estimateMax.toLocaleString('fr-FR')} €</div>
        <div class="disclaimer">⚠️ Ce montant est indicatif et non contractuel. Le tarif réel sera établi après visite sur site.</div>
      </div>

      <div class="range-explain">
        <div class="re-title">Pourquoi cette fourchette ?</div>
        <div class="re-low">
          <div class="re-label">✅ Ce qui vous rapproche de ${estimateMin.toLocaleString('fr-FR')} € (bas de fourchette)</div>
          <ul>${lowFactors.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>
        <div class="re-high">
          <div class="re-label">⚠️ Ce qui pourrait monter vers ${estimateMax.toLocaleString('fr-FR')} € (haut de fourchette)</div>
          <ul>${highFactors.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>
      </div>

      <div class="guide-section">
        <h3 style="margin-top:0; color: #1a2744;">📋 Votre guide pratique inclus dans le PDF</h3>
        <div class="tip">
          <span class="tip-icon">🔧</span>
          <div><strong>Entretien courant :</strong> Les gestes simples que vous pouvez faire vous-même pour prolonger la durée de vie de vos équipements.</div>
        </div>
        <div class="tip">
          <span class="tip-icon">⚡</span>
          <div><strong>Économies d'énergie :</strong> 5 réglages simples pour réduire votre facture jusqu'à 20% sans changer d'équipement.</div>
        </div>
        <div class="tip">
          <span class="tip-icon">🚨</span>
          <div><strong>Signaux d'alerte :</strong> Comment reconnaître une panne imminente avant qu'elle ne coûte cher.</div>
        </div>
      </div>

      <p style="text-align: center; margin: 32px 0 16px;">
        <strong>Prochaine étape :</strong>
      </p>
      <div style="text-align: center;">
        <a href="${SITE_URL}/rendez-vous?pid=${prospectId}" class="cta-btn">📅 Prendre rendez-vous</a>
        <a href="${SITE_URL}/rappel?pid=${prospectId}" class="cta-secondary">📞 Être rappelé(e)</a>
      </div>

      <p style="margin-top: 24px; font-size: 14px; color: #64748b;">
        Pour toute question, appelez directement : <strong><a href="tel:${COMPANY_PHONE_RAW}" style="color: #f97316;">${COMPANY_PHONE}</a></strong><br />
        Disponible 7j/7 — ${COMPANY_LOCATION}
      </p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} — ${COMPANY_LOCATION} — Depuis ${COMPANY_SINCE}<br />
      ${COMPANY_PHONE} | ${COMPANY_EMAIL}</p>
      <p><a href="${SITE_URL}/confidentialite" style="color: #94a3b8;">Politique de confidentialité</a> | <a href="${SITE_URL}/mentions-legales" style="color: #94a3b8;">Mentions légales</a></p>
    </div>
  </div>
  <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />
</body>
</html>`

  return getTransporter().sendMail({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Votre devis indicatif — ${serviceType}`,
    html,
    attachments: [
      {
        filename: 'devis-indicatif.pdf',
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf',
      },
    ],
  })
}

export async function sendCallbackRequest(data: {
  firstName: string
  phone: string
  preferredTime?: string
  message?: string
}) {
  return getTransporter().sendMail({
    from: FROM,
    replyTo: REPLY_TO,
    to: REPLY_TO,
    subject: `🔔 Demande de rappel — ${data.firstName}`,
    html: `
      <h2>Nouvelle demande de rappel</h2>
      <p><strong>Prénom :</strong> ${data.firstName}</p>
      <p><strong>Téléphone :</strong> ${data.phone}</p>
      <p><strong>Créneau préféré :</strong> ${data.preferredTime || 'Non précisé'}</p>
      <p><strong>Message :</strong> ${data.message || 'Aucun'}</p>
    `,
  })
}

export async function sendContactForm(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  return getTransporter().sendMail({
    from: FROM,
    replyTo: data.email,
    to: REPLY_TO,
    subject: `📩 Contact site — ${data.subject}`,
    html: `
      <h2>Nouveau message depuis le site</h2>
      <p><strong>Nom :</strong> ${data.name}</p>
      <p><strong>Email :</strong> ${data.email}</p>
      <p><strong>Téléphone :</strong> ${data.phone || 'Non renseigné'}</p>
      <p><strong>Sujet :</strong> ${data.subject}</p>
      <p><strong>Message :</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
  })
}

export async function sendOfferGuide(data: { to: string; offer: { title: string; items: string[]; cta: { label: string; href: string } } }) {
  const ctaUrl = `${SITE_URL}${data.offer.cta.href}`
  return getTransporter().sendMail({
    from: FROM,
    replyTo: REPLY_TO,
    to: data.to,
    subject: data.offer.title,
    html: `
      <h2 style="color:#1a2744">${data.offer.title}</h2>
      <ul>${data.offer.items.map((i) => `<li style="margin-bottom:8px">${i}</li>`).join('')}</ul>
      <p><a href="${ctaUrl}" style="color:#f97316;font-weight:bold">${data.offer.cta.label} →</a></p>
      <p style="color:#64748b;font-size:12px">${COMPANY_NAME} · ${COMPANY_LOCATION} · ${COMPANY_PHONE}<br />
      Vous ne recevrez pas d'autre email sans en avoir fait la demande. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>
    `,
  })
}

/* -------------------------------------------------------------------------- */
/*  Relances clients et récap quotidien                                       */
/* -------------------------------------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailShell(params: { title: string; subtitle: string; bodyHtml: string; footerNote?: string }): string {
  const { title, subtitle, bodyHtml, footerNote } = params
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #1a2744; padding: 28px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">${escapeHtml(COMPANY_NAME)}</h1>
      <p style="color: #94a3b8; margin: 8px 0 0;">${escapeHtml(subtitle)}</p>
    </div>
    <div style="padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.55;">
      ${bodyHtml}
    </div>
    <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p style="margin: 0 0 8px;">${escapeHtml(COMPANY_NAME)} — ${escapeHtml(COMPANY_LOCATION)} — Depuis ${escapeHtml(COMPANY_SINCE)}<br />
      ${escapeHtml(COMPANY_PHONE)} | ${escapeHtml(COMPANY_EMAIL)}</p>
      ${footerNote ? `<p style="margin: 0 0 8px;">${footerNote}</p>` : ''}
      <p style="margin: 0;"><a href="${SITE_URL}/confidentialite" style="color: #94a3b8;">Politique de confidentialité</a> | <a href="${SITE_URL}/mentions-legales" style="color: #94a3b8;">Mentions légales</a></p>
    </div>
  </div>
</body>
</html>`
}

function ctaButton(href: string, label: string, primary = true): string {
  const background = primary ? '#f97316' : '#1a2744'
  return `<a href="${href}" style="display: inline-block; background: ${background}; color: #fff; text-decoration: none; padding: 13px 24px; border-radius: 6px; font-weight: bold; font-size: 15px; margin: 6px;">${label}</a>`
}

export type FollowUpEmailKind = 'estimation' | 'devis'

export interface SendFollowUpEmailParams {
  to: string
  firstName: string
  kind: FollowUpEmailKind
  serviceType: string
  estimateMin: number
  estimateMax: number
  prospectId: string
}

const FOLLOW_UP_OPT_OUT =
  'Vous recevez ce message suite à votre demande sur notre site. Pour ne plus recevoir de relance de notre part, répondez STOP à cet e-mail.'

export function buildFollowUpEmail(params: SendFollowUpEmailParams): { subject: string; html: string } {
  const { firstName, kind, serviceType, estimateMin, estimateMax, prospectId } = params
  const name = escapeHtml(firstName)
  const service = escapeHtml(serviceType)
  const pid = encodeURIComponent(prospectId)

  if (kind === 'devis') {
    const replySubject = encodeURIComponent(`Mon devis — ${serviceType}`)
    return {
      subject: `Votre devis ${serviceType} : une question ?`,
      html: emailShell({
        title: `Votre devis — ${COMPANY_NAME}`,
        subtitle: 'Votre devis est toujours valable',
        bodyHtml: `
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Nous vous avons transmis un devis pour : <strong>${service}</strong>.</p>
      <p>Avez-vous eu le temps de le consulter ? Si vous avez une question, si vous souhaitez ajuster un point ou fixer une date d'intervention, répondez simplement à cet e-mail ou appelez-nous.</p>
      <div style="text-align: center; margin: 28px 0 8px;">
        ${ctaButton(`tel:${COMPANY_PHONE_RAW}`, `📞 Appeler le ${escapeHtml(COMPANY_PHONE)}`)}
        ${ctaButton(`mailto:${REPLY_TO}?subject=${replySubject}`, '✉️ Répondre par e-mail', false)}
      </div>`,
        footerNote: FOLLOW_UP_OPT_OUT,
      }),
    }
  }

  return {
    subject: `Votre estimation ${serviceType} : on en parle ?`,
    html: emailShell({
      title: `Votre estimation — ${COMPANY_NAME}`,
      subtitle: 'Votre projet est-il toujours d’actualité ?',
      bodyHtml: `
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Il y a quelques jours, vous avez demandé une estimation pour : <strong>${service}</strong>.
      Elle était comprise entre <strong>${estimateMin.toLocaleString('fr-FR')} €</strong> et <strong>${estimateMax.toLocaleString('fr-FR')} €</strong>.</p>
      <p>Ce montant reste indicatif : le tarif réel est établi après une visite sur place. Si votre projet est toujours d'actualité, choisissez la suite qui vous arrange :</p>
      <div style="text-align: center; margin: 28px 0 8px;">
        ${ctaButton(`${SITE_URL}/rendez-vous?pid=${pid}`, '📅 Prendre rendez-vous')}
        ${ctaButton(`${SITE_URL}/rappel?pid=${pid}`, '📞 Être rappelé(e)', false)}
      </div>
      <p style="font-size: 13px; color: #64748b;">Votre projet est reporté ou déjà réglé ? Ignorez simplement ce message.</p>`,
      footerNote: FOLLOW_UP_OPT_OUT,
    }),
  }
}

export async function sendFollowUpEmail(params: SendFollowUpEmailParams) {
  const { subject, html } = buildFollowUpEmail(params)
  return getTransporter().sendMail({
    from: FROM,
    replyTo: REPLY_TO,
    to: params.to,
    subject,
    html,
  })
}

export interface DigestLeadItem {
  id: string
  firstName: string
  city: string
  serviceLabel: string
  urgent: boolean
  estimateMin: number
  estimateMax: number
}

export interface DigestData {
  /** Date du jour, déjà formatée (ex. « jeudi 20 novembre 2026 »). */
  dateLabel: string
  newLeads: DigestLeadItem[]
  toProcessCount: number
  toCompleteCount: number
  visitsToPlan: DigestLeadItem[]
  quotesToFollowUp: DigestLeadItem[]
  followUpsSent: { firstName: string; kindLabel: string }[]
}

export function digestHasContent(d: DigestData): boolean {
  return (
    d.newLeads.length > 0 ||
    d.toProcessCount > 0 ||
    d.toCompleteCount > 0 ||
    d.visitsToPlan.length > 0 ||
    d.quotesToFollowUp.length > 0 ||
    d.followUpsSent.length > 0
  )
}

function digestList(title: string, items: DigestLeadItem[]): string {
  if (items.length === 0) return ''
  const rows = items
    .slice(0, 10)
    .map(
      (l) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
            <a href="${SITE_URL}/admin/leads/${encodeURIComponent(l.id)}" style="color: #1a2744; font-weight: bold; text-decoration: none;">${escapeHtml(l.firstName)}</a>
            ${l.urgent ? '<span style="background: #fee2e2; color: #b91c1c; font-size: 11px; padding: 2px 6px; border-radius: 10px; margin-left: 6px;">Urgence</span>' : ''}
            <div style="font-size: 12px; color: #64748b;">${escapeHtml(l.serviceLabel)} · ${escapeHtml(l.city)} · ${l.estimateMin.toLocaleString('fr-FR')} – ${l.estimateMax.toLocaleString('fr-FR')} €</div>
          </td>
        </tr>`,
    )
    .join('')
  const more = items.length > 10 ? `<p style="font-size: 12px; color: #64748b;">… et ${items.length - 10} autre(s) dans l'administration.</p>` : ''
  return `
      <h3 style="color: #1a2744; margin: 28px 0 6px; font-size: 16px;">${escapeHtml(title)} (${items.length})</h3>
      <table style="width: 100%; border-collapse: collapse;">${rows}</table>${more}`
}

function digestCounter(value: number, label: string): string {
  return `
        <td style="text-align: center; padding: 10px 4px;">
          <div style="font-size: 26px; font-weight: bold; color: #1a2744;">${value}</div>
          <div style="font-size: 11px; color: #64748b;">${escapeHtml(label)}</div>
        </td>`
}

export function buildDailyDigest(d: DigestData): { subject: string; html: string } {
  const sentBlock =
    d.followUpsSent.length === 0
      ? ''
      : `
      <h3 style="color: #1a2744; margin: 28px 0 6px; font-size: 16px;">Relances envoyées automatiquement (${d.followUpsSent.length})</h3>
      <ul style="margin: 0; padding-left: 18px; color: #374151; font-size: 14px;">
        ${d.followUpsSent.map((f) => `<li>${escapeHtml(f.firstName)} — ${escapeHtml(f.kindLabel)}</li>`).join('')}
      </ul>`

  const html = emailShell({
    title: `Récap du jour — ${COMPANY_NAME}`,
    subtitle: `Récap du ${d.dateLabel}`,
    bodyHtml: `
      <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px;">
        <tr>
          ${digestCounter(d.newLeads.length, 'nouvelles (24 h)')}
          ${digestCounter(d.toProcessCount, 'à traiter')}
          ${digestCounter(d.toCompleteCount, 'à compléter')}
          ${digestCounter(d.quotesToFollowUp.length, 'devis à relancer')}
        </tr>
      </table>
      ${digestList('Nouvelles demandes', d.newLeads)}
      ${digestList('Visites à planifier', d.visitsToPlan)}
      ${digestList('Devis à relancer par téléphone', d.quotesToFollowUp)}
      ${sentBlock}
      <div style="text-align: center; margin: 32px 0 4px;">
        ${ctaButton(`${SITE_URL}/admin/leads`, 'Ouvrir les demandes')}
      </div>`,
  })

  const toTreat = d.toProcessCount + d.toCompleteCount
  const subject =
    toTreat > 0
      ? `Récap du jour : ${toTreat} demande${toTreat > 1 ? 's' : ''} à traiter`
      : 'Récap du jour : rien d’urgent'
  return { subject, html }
}

/** Boîte qui reçoit le récap : celle des notifications du site, ou ADMIN_NOTIFY_EMAIL si renseignée. */
export function getDigestRecipient(): string {
  return process.env.ADMIN_NOTIFY_EMAIL || REPLY_TO
}

export async function sendDailyDigest(d: DigestData) {
  const { subject, html } = buildDailyDigest(d)
  return getTransporter().sendMail({
    from: FROM,
    replyTo: REPLY_TO,
    to: getDigestRecipient(),
    subject,
    html,
  })
}
