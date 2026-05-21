import { betterAuth } from "better-auth";
import { env } from "$env/dynamic/private";
import { db } from "./db";

const trustedOrigins = (env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const auth = betterAuth({
    database: db,
    trustedOrigins,
    emailAndPassword: { enabled: true },
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
