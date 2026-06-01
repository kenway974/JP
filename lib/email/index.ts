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
const COMPANY_LOCATION = process.env.NEXT_PUBLIC_COMPANY_LOCATION || 'Votre région'
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
