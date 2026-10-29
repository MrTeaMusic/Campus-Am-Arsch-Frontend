/** Selbst gewählte App-Farbe und Hell/Dunkel, gespeichert im Browser. Die Farben stehen in app.css. */

export type Accent = {
	id: string;
	name: string;
	/** Farbe der Auswahl-Kachel in den Einstellungen */
	swatch: string;
};

export const accents: Accent[] = [
	{ id: 'blau', name: 'Blau', swatch: '#2f6fb0' },
	{ id: 'lila', name: 'Lila', swatch: '#7c4dcc' },
	{ id: 'pink', name: 'Pink', swatch: '#c93a7c' },
	{ id: 'orange', name: 'Orange', swatch: '#d0661c' },
	{ id: 'gruen', name: 'Grün', swatch: '#1f8a5b' },
	{ id: 'tuerkis', name: 'Türkis', swatch: '#0f8a8f' }
];

export type Mode = 'auto' | 'hell' | 'dunkel';

export const modes: { id: Mode; name: string }[] = [
	{ id: 'auto', name: 'Automatisch' },
	{ id: 'hell', name: 'Hell' },
	{ id: 'dunkel', name: 'Dunkel' }
];

export type Appearance = { accent: string; mode: Mode };

const STORAGE_KEY = 'appearance';
export const APPEARANCE_EVENT = 'appearancechange';

export function loadAppearance(): Appearance {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
		return { accent: stored.accent ?? 'blau', mode: stored.mode ?? 'auto' };
	} catch {
		return { accent: 'blau', mode: 'auto' };
	}
}

/** Same logic as the inline script in app.html, which applies the choice before the first paint */
export function applyAppearance(appearance: Appearance) {
	const root = document.documentElement;
	if (appearance.accent === 'blau') delete root.dataset.accent;
	else root.dataset.accent = appearance.accent;

	if (appearance.mode === 'hell') root.dataset.theme = 'campus';
	else if (appearance.mode === 'dunkel') root.dataset.theme = 'campus-dark';
	else delete root.dataset.theme;

	localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
	window.dispatchEvent(new Event(APPEARANCE_EVENT));
}
