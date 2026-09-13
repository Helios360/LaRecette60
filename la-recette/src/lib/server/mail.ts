import { Resend } from "resend";
import { env } from "$env/dynamic/private";

const TO = "larecette60@gmail.com";

function getResend() {
    return new Resend(env.RESEND_API_KEY);
}

export async function sendContactEmail(opts: {
    name: string;
    email: string;
    phone: string;
    message: string;
    photos: { filename: string; content: string; contentType: string }[];
}) {
    const html = [
        `<p><strong>Nom :</strong> ${esc(opts.name)}</p>`,
        `<p><strong>Email :</strong> ${esc(opts.email)}</p>`,
        opts.phone ? `<p><strong>Téléphone :</strong> ${esc(opts.phone)}</p>` : "",
        `<hr><p><strong>Message :</strong></p>`,
        `<p style="white-space:pre-wrap">${esc(opts.message)}</p>`,
    ].join("\n");

    const resend = getResend();
    const attachments = opts.photos.map((p) => ({
        filename: p.filename,
        content: p.content.split(",").pop()!,
    }));

    const { error } = await resend.emails.send({
        from: "La Recette <delivered@resend.dev>",
        to: TO,
        replyTo: opts.email,
        subject: `[La Recette] Demande de devis de ${opts.name}`,
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
    });
    if (error) throw new Error(error.message);
}

export async function sendForgotPasswordEmail(opts: { email: string; name: string; url: string }) {
    const html = [
        `<p>Bonjour ${esc(opts.name)},</p>`,
        `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>`,
        `<p><a href="${esc(opts.url)}">Cliquez ici pour réinitialiser votre mot de passe</a></p>`,
        `<p>Ce lien expire dans 1 heure.</p>`,
        `<hr><p style="font-size:0.85em;color:#888">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>`,
    ].join("\n");

    const resend = getResend();
    const { error } = await resend.emails.send({
        from: "La Recette <delivered@resend.dev>",
        to: opts.email,
        subject: "Réinitialisation de votre mot de passe - La Recette",
        html,
    });
    if (error) throw new Error(error.message);
}

function esc(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}