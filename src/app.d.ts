// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'ios-pwa-splash';

declare const __APP_COMMIT__: string;
declare const __APP_BUILD__: string;
declare const __APP_BUILT_AT__: string;
