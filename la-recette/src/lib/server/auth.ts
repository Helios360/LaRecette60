import { betterAuth } from "better-auth";
import { env } from "$env/dynamic/private";
import { pool } from "./db";
import { sendForgotPasswordEmail } from "./mail";

const trustedOrigins = (env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const auth = betterAuth({
    database: pool,
    trustedOrigins,
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
            await sendForgotPasswordEmail({
                email: user.email,
                name: user.name,
                url,
            });
        },
    },
    user: {
        additionalFields: {
            phone:   { type: "string", required: true },
            fname:   { type: "string", required: false },
            address: { type: "string", required: false },
            city:    { type: "string", required: false },
            role:    { type: "number", required: false, defaultValue: 0, input: false },
        },
        deleteUser: { enabled: true },
        changeEmail: { enabled: true },
    },
});

export type Auth = typeof auth;
export type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;