import { execSync } from 'node:child_process';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Git-Stand zum Zeitpunkt des Builds, damit man auf der Seite sieht, welche Version läuft
function git(args: string, fallback: string) {
	try {
		return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return fallback;
	}
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	define: {
		__APP_COMMIT__: JSON.stringify(git('rev-parse --short HEAD', 'unbekannt')),
		__APP_BUILD__: JSON.stringify(git('rev-list --count HEAD', '?')),
		__APP_BUILT_AT__: JSON.stringify(new Date().toISOString())
	}
});
