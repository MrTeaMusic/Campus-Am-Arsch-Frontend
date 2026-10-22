/** `YYYY-MM-DDTHH:MM` in local time, the format of <input type="datetime-local"> and of the API */
export function localDateTime(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const dateFormat = new Intl.DateTimeFormat('de-DE', {
	weekday: 'short',
	day: '2-digit',
	month: '2-digit'
});

/** "Mo., 26.10. 10:00 – 12:00" (with the end date when it is on another day) */
export function formatSharedTime(start: string, end: string): string {
	const s = new Date(start);
	const e = new Date(end);
	const time = (d: Date) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
	const sameDay = start.slice(0, 10) === end.slice(0, 10);
	return sameDay
		? `${dateFormat.format(s)} ${time(s)} – ${time(e)}`
		: `${dateFormat.format(s)} ${time(s)} – ${dateFormat.format(e)} ${time(e)}`;
}
