import { fail } from "@sveltejs/kit";
import { sendContactEmail } from "$lib/server/mail";
import type { Actions } from "./$types";

const MIME_WHITELIST = ["image/jpeg", "image/png", "image/webp"];
const MAX_COUNT = 3;
const MAX_SIZE = 5_000_000;

export const actions: Actions = {
    default: async ({ request }) => {
        const fd = await request.formData();

        const name = (fd.get("name") as string)?.trim() ?? "";
        const email = (fd.get("email") as string)?.trim() ?? "";
        const phone = (fd.get("phone") as string)?.trim() ?? "";
        const message = (fd.get("message") as string)?.trim() ?? "";

        if (!name || !email || !message) {
            return fail(400, { error: "Veuillez remplir les champs obligatoires (nom, email, message)." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            return fail(400, { error: "Email invalide." });
        }

        const entries = fd.getAll("photos") as File[];
        const photos = await Promise.all(
            entries
                .filter((f) => {
                    if (!MIME_WHITELIST.includes(f.type)) return false;
                    if (f.size > MAX_SIZE) return false;
                    return true;
                })
                .slice(0, MAX_COUNT)
                .map(async (f) => ({
                    filename: f.name,
                    contentType: f.type,
                    content: Buffer.from(await f.arrayBuffer()).toString("base64"),
                }))
        );

        try {
            await sendContactEmail({ name, email, phone, message, photos });
            return { success: true };
        } catch (e) {
            console.error("contact email error:", e);
            return fail(500, {
                error: "Impossible d'envoyer le message pour le moment. Contactez-nous par téléphone ou email.",
            });
        }
    },
};