import { writable } from 'svelte/store';
import type { EventUnix, SharedEvent } from '$lib/types';
import { toastError } from '$lib/stores/toast';
import { localDateTime } from '$lib/TSHelpers/SharedCalendarHelper';

/** Einträge des gemeinsamen Kalenders, null bis sie geladen sind. Gemeinsam genutzt von der Kachel
 * des gemeinsamen Kalenders und vom Stundenplan-Kalender. */
export const sharedEvents = writable<SharedEvent[] | null>(null);

// the timetable calendar also shows the past weeks
const HISTORY_DAYS = 60;

export async function loadSharedEvents() {
	const from = localDateTime(new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000));
	const res = await fetch(`/api/sharedcal?from=${encodeURIComponent(from)}`);
	if (!res.ok) {
		toastError(await res.text());
		return;
	}
	sharedEvents.set(await res.json());
}

export function sharedToUnixEvents(events: SharedEvent[]): EventUnix[] {
	return events.map((event) => ({
		start: new Date(event.start).getTime(),
		end: new Date(event.end).getTime(),
		title: `👥 ${event.title}`,
		room: '',
		sroom: '',
		instructor: event.author ? `von ${event.author}` : '',
		textColor: '#ffffff',
		description: event.description,
		remarks: '',
		color: '#6d5bd0'
	}));
}
