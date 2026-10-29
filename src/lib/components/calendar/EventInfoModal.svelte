<script lang="ts">
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faDoorOpen, faInfo, faPlus, faUser } from '@fortawesome/free-solid-svg-icons';

	let {
		modal = $bindable<HTMLDialogElement | null>(null),
		event = $bindable<unknown | null>(null)
	} = $props();

	const formatEventTime = (eventData: unknown) => {
		const start =
			eventData && typeof eventData === 'object'
				? (eventData as { start?: Date }).start
				: undefined;
		const end =
			eventData && typeof eventData === 'object' ? (eventData as { end?: Date }).end : undefined;
		if (!(start instanceof Date)) return undefined;
		const formatTime = (date: Date) =>
			date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
		const startText = formatTime(start);
		if (!(end instanceof Date)) return `${startText} Uhr`;
		return `${startText}-${formatTime(end)} Uhr`;
	};

	const getTitleText = (eventData: unknown) => {
		const title =
			eventData && typeof eventData === 'object'
				? (eventData as { title?: unknown }).title
				: undefined;
		if (typeof title === 'string') return title;
		if (title && typeof title === 'object' && 'html' in title) {
			const htmlTitle = (title as { html?: string }).html;
			return typeof htmlTitle === 'string' ? htmlTitle : undefined;
		}
		return undefined;
	};

	const getColor = (eventData: unknown) => {
		const color =
			eventData && typeof eventData === 'object'
				? (eventData as { backgroundColor?: unknown; color?: unknown }).backgroundColor
				: undefined;
		return typeof color === 'string' && color ? color : undefined;
	};

	const getExtendedProp = (eventData: unknown, key: string) => {
		const extendedProps =
			eventData && typeof eventData === 'object'
				? (eventData as { extendedProps?: Record<string, unknown> }).extendedProps
				: undefined;
		const value = extendedProps?.[key];
		return typeof value === 'string' ? value : undefined;
	};
</script>

<dialog bind:this={modal} class="modal modal-bottom select-none sm:modal-middle">
	<div class="modal-box pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
		<form method="dialog">
			<button class="btn absolute top-3 right-3 btn-circle btn-ghost btn-sm" aria-label="Schließen"
				>✕</button
			>
		</form>
		{#if event}
			<div class="flex items-start gap-3 pr-10">
				<span
					class="mt-1 h-10 w-1.5 shrink-0 rounded-full"
					style="background-color: {getColor(event) ?? 'var(--color-primary)'}"
				></span>
				<div class="min-w-0">
					<h3 class="text-lg leading-snug font-bold">{getTitleText(event) ?? 'Termin'}</h3>
					<p class="text-sm opacity-60">{formatEventTime(event) ?? '-'}</p>
				</div>
			</div>
			<div class="mt-4 grid gap-2">
				<div class="flex items-center gap-3 rounded-xl bg-base-200 p-3">
					<span
						class="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/10 text-primary"
					>
						<FontAwesomeIcon icon={faDoorOpen} />
					</span>
					<div>
						<p class="text-xs opacity-60">Raum</p>
						<p class="font-medium">{getExtendedProp(event, 'room') || '-'}</p>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-xl bg-base-200 p-3">
					<span
						class="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/10 text-primary"
					>
						<FontAwesomeIcon icon={faUser} />
					</span>
					<div>
						<p class="text-xs opacity-60">Dozent</p>
						<p class="font-medium">{getExtendedProp(event, 'instructor') || '-'}</p>
					</div>
				</div>
				{#if getExtendedProp(event, 'description')}
					<div class="flex items-center gap-3 rounded-xl bg-base-200 p-3">
						<span
							class="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/10 text-primary"
						>
							<FontAwesomeIcon icon={faInfo} />
						</span>
						<p class="min-w-0 text-sm">{getExtendedProp(event, 'description')}</p>
					</div>
				{/if}
				{#if getExtendedProp(event, 'remarks')}
					<div class="flex items-center gap-3 rounded-xl bg-base-200 p-3">
						<span
							class="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/10 text-primary"
						>
							<FontAwesomeIcon icon={faPlus} />
						</span>
						<div class="min-w-0">
							<p class="text-xs opacity-60">Info</p>
							<p class="text-sm">{getExtendedProp(event, 'remarks')}</p>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<h3 class="text-lg font-bold">Termininfo</h3>
			<p class="py-4">Keine Details verfügbar.</p>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
