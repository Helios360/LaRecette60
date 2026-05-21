import type { LayoutServerLoad } from "./$types";
import { isAdmin } from "$lib/server/admin";

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user ?? null;
    return { user, isAdmin: isAdmin(user) };
};
