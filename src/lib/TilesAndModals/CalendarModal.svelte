<script lang="ts">
	import { type EventUnix } from '$lib/types';
	import DashboardModal from '$lib/DashboardModal.svelte';
	import { type SvelteComponent } from 'svelte';
	import { Calendar, TimeGrid } from '@event-calendar/core';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
	import { unixEventsToEvents } from '$lib/Calendar/CalendarFuncs';
	import EventInfoModal from '$lib/components/calendar/EventInfoModal.svelte';
	import { SvelteDate } from 'svelte/reactivity';

	let ec: SvelteComponent | undefined = $state();
	let {
		modal = $bindable<HTMLDialogElement | null>(null),
		events
	}: {
		modal: HTMLDialogElement | null;
		events: EventUnix[];
	} = $props();

	let eventInfoModal = $state<HTMLDialogElement | null>(null);
	let selectedEvent = $state<unknown | null>(null);

	type dayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

	const hiddenDays: dayOfWeek[] = [0, 6];

	const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

	let options = $derived({
		view: 'timeGridWeek',
		events: unixEventsToEvents(events),
		height: '100%',
		allDaySlot: false,
		nowIndicator: true,
		hiddenDays: hiddenDays,
		// "Mo" over "26", the day number of today is highlighted via CSS
		dayHeaderFormat: (date: Date) => ({
			html: `<span class="wd">${date.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '')}</span><span class="dn">${date.getDate()}</span>`
		}),
		headerToolbar: {
			start: '',
			center: '',
			end: ''
		},
		eventClick: (info: { event: unknown }) => {
			selectedEvent = info.event;
			eventInfoModal?.showModal();
		},
		eventContent: (info: {
			event: { title?: unknown; extendedProps?: Record<string, unknown>; start: Date };
			timeText: string;
		}) => {
			const timeStart = info.event.start.toLocaleTimeString('de', { timeStyle: 'short' });
			const title = typeof info.event.title === 'string' ? info.event.title : '';
			return {
				html: `<span class="ev-time">${timeStart}</span><span class="ev-title">${escapeHtml(title)}</span>`
			};
		}
	});

	$effect(() => {
		ec?.setOption('events', unixEventsToEvents(events));
	});

	let isCurrentWeek = $state(() => {
		const view = ec?.getView();
		if (!view) return false;

		const start = new SvelteDate(view.currentStart);
		start.setDate(start.getDate() + 1);

		const end = new SvelteDate(view.currentEnd);
		end.setDate(end.getDate() + 1);

		const now = new Date();
		return start <= now && now <= end;
	});
</script>

<EventInfoModal bind:modal={eventInfoModal} event={selectedEvent} />

<DashboardModal bind:modal title="Kalender">
	<div class="flex w-full flex-row items-center">
		{#if ec}
			<p class="text-lg font-semibold tracking-tight">{ec.getView().title}</p>
		{/if}
		<span class="grow"></span>

		<button
			disabled={isCurrentWeek()}
			onclick={() => {
				let today = new SvelteDate();
				// sonntag in deutschland ^= teil der vorh. Woche, in USA schon nächste woche, daher -1
				today.setDate(today.getDate() - 1);

				if (ec) ec.setOption('date', today);
			}}
			class="btn mr-1 rounded-full btn-soft btn-sm btn-primary">Heute</button
		>

		<div class="flex gap-1">
			<button
				class="btn btn-circle btn-soft btn-sm btn-primary"
				aria-label="Vorherige Woche"
				onclick={() => {
					if (ec) ec.prev();
				}}><FontAwesomeIcon icon={faChevronLeft} /></button
			>
			<button
				class="btn btn-circle btn-soft btn-sm btn-primary"
				aria-label="Nächste Woche"
				onclick={() => {
					if (ec) ec.next();
				}}><FontAwesomeIcon icon={faChevronRight} /></button
			>
		</div>
	</div>

	<div
		lang="de"
		class="weekCalendar mt-3 min-h-0 grow overflow-hidden rounded-box border border-base-300/70"
	>
		<Calendar bind:this={ec} plugins={[TimeGrid]} {options} />
	</div>
</DashboardModal>

<style>
	:global(.weekCalendar .ec) {
		border: none;
	}
	:global(.weekCalendar .ec-toolbar) {
		display: none;
	}
	:global(.weekCalendar .ec-header) {
		border-inline: none;
		background-color: var(--color-base-100);
	}
	:global(.weekCalendar .ec-col-head) {
		padding: 0.4rem 0;
	}
	:global(.weekCalendar .ec-col-head .wd) {
		display: block;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.55;
	}
	:global(.weekCalendar .ec-col-head .dn) {
		display: inline-grid;
		place-content: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 999px;
		font-size: 1rem;
		font-weight: 700;
	}
	:global(.weekCalendar .ec-col-head.ec-today .dn) {
		background-color: var(--color-primary);
		color: var(--color-primary-content);
	}
	:global(.weekCalendar .ec-sidebar) {
		font-size: 0.75rem;
		color: color-mix(in oklab, var(--color-base-content) 55%, transparent);
	}
	:global(.weekCalendar .ec-event) {
		cursor: pointer;
		padding: 0.25rem 0.375rem;
		border-radius: 0.5rem;
		border-inline-start: 3px solid rgb(0 0 0 / 0.18);
		box-shadow: none;
		overflow: hidden;
	}
	:global(.weekCalendar .ec-event-body) {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.25;
	}
	:global(.weekCalendar .ev-time) {
		font-size: 0.7rem;
		opacity: 0.85;
	}
	:global(.weekCalendar .ev-title) {
		font-size: 0.75rem;
		font-weight: 600;
		overflow-wrap: break-word;
		hyphens: auto;
	}
</style>
