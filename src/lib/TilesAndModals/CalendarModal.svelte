<script lang="ts">
	import { type EventUnix } from '$lib/types';
	import DashboardModal from '$lib/DashboardModal.svelte';
	import { onMount, type SvelteComponent } from 'svelte';
	import { Calendar, TimeGrid } from '@event-calendar/core';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
	import { unixEventsToEvents } from '$lib/Calendar/CalendarFuncs';
	import EventInfoModal from '$lib/components/calendar/EventInfoModal.svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { getNextWeekday, isSameDate } from '$lib/TSHelpers/DateHelper';

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

	// on phones five days side by side leave no room for the module names, so show one day there
	let narrow = $state(false);
	onMount(() => {
		const query = window.matchMedia('(max-width: 639px)');
		narrow = query.matches;
		const onChange = (e: MediaQueryListEvent) => (narrow = e.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	// the toggle in the toolbar overrides the screen size default
	let chosenView = $state<'day' | 'week' | null>(null);
	let dayMode = $derived(chosenView ? chosenView === 'day' : narrow);

	// the day view would show empty weekends, so step from Friday straight to Monday and back
	function stepDay(forward: boolean) {
		if (!ec) return;
		const date = new SvelteDate(ec.getOption('date'));
		do {
			date.setDate(date.getDate() + (forward ? 1 : -1));
		} while (hiddenDays.includes(date.getDay() as dayOfWeek));
		ec.setOption('date', date);
	}

	// a name that does not fit its lecture ends with "…", the full name is in the details on click
	function clampToEvent(el: HTMLElement) {
		const text = el.querySelector<HTMLElement>('.ev-text');
		if (!text) return;
		const fit = () => {
			const style = getComputedStyle(el);
			const room = el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
			const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
			text.style.setProperty('--lines', String(Math.max(1, Math.floor(room / lineHeight))));
		};
		fit();
		new ResizeObserver(fit).observe(el);
	}

	const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

	let options = $derived({
		view: dayMode ? 'timeGridDay' : 'timeGridWeek',
		events: unixEventsToEvents(events),
		height: '100%',
		allDaySlot: false,
		// taller hours on phones so that the module names have room
		slotHeight: dayMode ? 40 : 32,
		scrollTime: '07:30:00',
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
		eventDidMount: (info: { el: HTMLElement }) => clampToEvent(info.el),
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
				html: `<span class="ev-text"><span class="ev-time">${timeStart}</span><span class="ev-title">${escapeHtml(title)}</span></span>`
			};
		}
	});

	$effect(() => {
		ec?.setOption('events', unixEventsToEvents(events));
	});

	let isCurrentWeek = $state(() => {
		const view = ec?.getView();
		if (!view) return false;
		if (dayMode) return isSameDate(new Date(ec!.getOption('date')), getNextWeekday());

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
				if (dayMode) {
					if (ec) ec.setOption('date', getNextWeekday());
					return;
				}
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
				aria-label={dayMode ? 'Vorheriger Tag' : 'Vorherige Woche'}
				onclick={() => {
					if (dayMode) stepDay(false);
					else if (ec) ec.prev();
				}}><FontAwesomeIcon icon={faChevronLeft} /></button
			>
			<button
				class="btn btn-circle btn-soft btn-sm btn-primary"
				aria-label={dayMode ? 'Nächster Tag' : 'Nächste Woche'}
				onclick={() => {
					if (dayMode) stepDay(true);
					else if (ec) ec.next();
				}}><FontAwesomeIcon icon={faChevronRight} /></button
			>
		</div>
	</div>

	<div class="join mt-3 w-full" role="group" aria-label="Ansicht">
		<button
			class="btn join-item grow btn-sm {dayMode ? 'btn-primary' : 'btn-soft'}"
			aria-pressed={dayMode}
			onclick={() => (chosenView = 'day')}>Tag</button
		>
		<button
			class="btn join-item grow btn-sm {dayMode ? 'btn-soft' : 'btn-primary'}"
			aria-pressed={!dayMode}
			onclick={() => (chosenView = 'week')}>Woche</button
		>
	</div>

	<div
		lang="de"
		class:dayView={dayMode}
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
		display: block;
		min-width: 0;
	}
	/* time and name flow as one text that ends with "…" where the lecture is too short */
	:global(.weekCalendar .ev-text) {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: var(--lines, 2);
		line-clamp: var(--lines, 2);
		overflow: hidden;
		font-size: 0.75rem;
		line-height: 1.25;
		/* long German compounds are hyphenated instead of being cut off */
		overflow-wrap: break-word;
		hyphens: auto;
	}
	:global(.weekCalendar.dayView .ev-text) {
		font-size: 0.875rem;
	}
	:global(.weekCalendar .ev-time) {
		margin-inline-end: 0.3rem;
		font-size: 0.9em;
		opacity: 0.85;
	}
	/* five narrow columns have no room for the time, it is in the details on click */
	@media (max-width: 639px) {
		:global(.weekCalendar:not(.dayView) .ev-time) {
			display: none;
		}
	}
	:global(.weekCalendar .ev-title) {
		font-weight: 600;
	}
</style>
