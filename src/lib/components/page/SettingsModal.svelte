<script lang="ts">
	import { onMount } from 'svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faCheck, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';
	import {
		accents,
		applyAppearance,
		loadAppearance,
		modes,
		type Appearance
	} from '$lib/TSHelpers/Appearance';

	let modal: HTMLDialogElement | null = $state(null);
	let appearance: Appearance = $state({ accent: 'blau', mode: 'auto' });

	onMount(() => {
		appearance = loadAppearance();
	});

	function choose(change: Partial<Appearance>) {
		appearance = { ...appearance, ...change };
		applyAppearance(appearance);
	}
</script>

<button
	class="btn btn-circle btn-ghost btn-sm"
	aria-label="Einstellungen"
	title="Einstellungen"
	onclick={() => modal?.showModal()}
>
	<FontAwesomeIcon icon={faGear} class="text-base opacity-70" />
</button>

<dialog class="modal modal-bottom select-none sm:modal-middle" bind:this={modal}>
	<div class="modal-box pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
		<form method="dialog" class="flex items-center justify-between">
			<h3 class="text-lg font-bold tracking-tight">Einstellungen</h3>
			<button class="btn btn-circle btn-ghost btn-sm" aria-label="Schließen"
				><FontAwesomeIcon icon={faXmark} /></button
			>
		</form>

		<p class="mt-4 mb-2 text-sm font-semibold opacity-70">Farbe der App</p>
		<div class="grid grid-cols-3 gap-2">
			{#each accents as accent (accent.id)}
				<button
					class="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm {appearance.accent ===
					accent.id
						? 'border-base-content/40 bg-base-200 font-semibold'
						: 'border-base-300 hover:bg-base-200'}"
					aria-pressed={appearance.accent === accent.id}
					onclick={() => choose({ accent: accent.id })}
				>
					<span
						class="grid size-9 place-content-center rounded-full text-white shadow-sm"
						style="background-color: {accent.swatch}"
					>
						{#if appearance.accent === accent.id}
							<FontAwesomeIcon icon={faCheck} />
						{/if}
					</span>
					{accent.name}
				</button>
			{/each}
		</div>

		<p class="mt-5 mb-2 text-sm font-semibold opacity-70">Darstellung</p>
		<div class="join w-full">
			{#each modes as mode (mode.id)}
				<button
					class="btn join-item flex-1 btn-sm {appearance.mode === mode.id
						? 'btn-primary'
						: 'btn-soft'}"
					aria-pressed={appearance.mode === mode.id}
					onclick={() => choose({ mode: mode.id })}>{mode.name}</button
				>
			{/each}
		</div>
		<p class="mt-2 text-xs opacity-60">
			„Automatisch“ folgt der Einstellung deines Geräts. Deine Auswahl wird nur auf diesem Gerät
			gespeichert.
		</p>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
