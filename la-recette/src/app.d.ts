// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SessionData } from "$lib/server/auth";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: NonNullable<SessionData>["user"] | null;
			session: NonNullable<SessionData>["session"] | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
