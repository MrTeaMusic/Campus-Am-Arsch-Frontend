import type { Event, EventUnix } from '$lib/types';

export function unixEventsToEvents(uEvents: Array<EventUnix>): Array<Event> {
	const events: Event[] = [];

	uEvents.forEach((event) => {
		events.push({
			...event,
			start: new Date(event.start),
			end: new Date(event.end),
			extendedProps: {
				room: event.room,
				sroom: event.sroom,
				instructor: event.instructor,
				description: event.description,
				remarks: event.remarks
			}
		});
	});

	return events;
}

// red is what the Campus-API sends for exams, they keep it
const EXAM_COLOR = '#d41610';

// distinct colors that all carry white text, in light and dark mode
const COURSE_COLORS = [
	'#2f6fb0',
	'#7c4dcc',
	'#1f8a5b',
	'#d0661c',
	'#0f8a8f',
	'#c93a7c',
	'#8a6d1f',
	'#4a5bd0',
	'#5f7f1f',
	'#5d6b82',
	'#9b5a2a',
	'#a23fb0'
];

function hashString(text: string): number {
	let hash = 0;
	for (const char of text) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}
	return hash;
}

/** Gives every course its own color: the same course always gets the same one, and different
 * courses get different ones as long as the palette has room. Exams stay red. */
export function colorByCourse(events: EventUnix[]): EventUnix[] {
	const courses = [...new Set(events.map((event) => event.title))].sort();
	const colorOf = new Map<string, string>();
	const taken = new Set<number>();

	for (const course of courses) {
		let slot = hashString(course) % COURSE_COLORS.length;
		// probe for a free color, once all are used the hashed one is shared
		for (let i = 0; i < COURSE_COLORS.length && taken.has(slot); i++) {
			slot = (slot + 1) % COURSE_COLORS.length;
		}
		taken.add(slot);
		colorOf.set(course, COURSE_COLORS[slot]);
	}

	return events.map((event) =>
		event.color.toLowerCase() === EXAM_COLOR
			? event
			: { ...event, color: colorOf.get(event.title)!, textColor: '#ffffff' }
	);
}
