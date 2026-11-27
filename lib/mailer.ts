import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Envoi d'e-mails (confirmations de rendez-vous). Facultatif : sans réglage SMTP, rien n'est envoyé
 * (les rendez-vous sont quand même enregistrés et visibles dans admin → Rendez-vous).
 *
 * Variables d'environnement :
 *   SMTP_HOST, SMTP_PORT (465 ou 587), SMTP_USER, SMTP_PASS
 *   MAIL_FROM  expéditeur affiché, ex. « Tropi'Com <admin@tropicomagency.com> » (par défaut SMTP_USER)
 *   MAIL_TEAM  adresse qui reçoit les nouveaux rendez-vous (par défaut admin@tropicomagency.com)
 * Avec Google Workspace : SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER=admin@tropicomagency.com,
 * SMTP_PASS = « mot de passe d'application » du compte Google (Sécurité → Validation en deux étapes → Mots de passe des applications).
 */
export const mailReady = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
export const teamEmail = () => process.env.MAIL_TEAM || "admin@tropicomagency.com";

let transport: Transporter | undefined;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

type Mail = { to: string; subject: string; text: string; replyTo?: string; ics?: string };

/** envoie un e-mail ; renvoie false (sans erreur) si l'envoi n'est pas configuré ou échoue */
export async function sendMail({ to, subject, text, replyTo, ics }: Mail) {
  if (!mailReady()) return false;
  try {
    await getTransport().sendMail({
      from: process.env.MAIL_FROM || `Tropi'Com <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      replyTo,
      attachments: ics ? [{ filename: "rendez-vous-tropicom.ics", content: ics, contentType: "text/calendar; charset=utf-8; method=PUBLISH" }] : undefined,
    });
    return true;
  } catch (e) {
    console.error("E-mail non envoyé", e);
    return false;
  }
}
