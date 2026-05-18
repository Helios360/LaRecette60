import { betterAuth } from "better-auth";
import { db } from "./db";

export const auth = betterAuth({
    database: db,
    emailAndPassword: { enabled: true },
    user: {
        additionalFields: {
            phone:   { type: "string", required: true },
            fname:   { type: "string", required: false },
            address: { type: "string", required: false },
            city:    { type: "string", required: false },
            role:    { type: "number", required: false, defaultValue: 0, input: false },
        },
    }
});