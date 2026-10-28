<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	import { tileNames, validateComponentOrder } from '$lib/TSHelpers/ComponentOrder';
	import { toastError } from '$lib/stores/toast';
	import { faBars, faUpDownLeftRight, faXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	let modal: HTMLDialogElement | null = $state(null);

	let { componentOrder }: { componentOrder: Writable<string[]> } = $props();

	let items = $derived($componentOrder?.map((id) => ({ id, title: tileNames.get(id) })));

	function handleSort(e: CustomEvent) {
		items = e.detail.items;
	}

	function finalize(e: CustomEvent) {
		handleSort(e);
		let newSort = items.map((item) => item.id);

		if (!validateComponentOrder(newSort)) {
			toastError('Reorder failed');
		} else {
			componentOrder.set(newSort);
		}
	}
</script>

<button
	aria-label="Anordnung ändern"
	onclick={() => modal?.showModal()}
	title="Anordnung ändern"
	class="btn btn-circle border-base-300 bg-base-100 shadow-sm"
	><FontAwesomeIcon icon={faUpDownLeftRight} class="opacity-70" />
</button>

{#if items}
	<!--Dialog Element um Modal zu definieren-->
	<dialog class="modal select-none" bind:this={modal}>
		<div class="modal-box">
			<!--Knopf zum schließen des Modals-->
			<form method="dialog" class="flex items-center justify-between">
				<h4 class="text-center text-lg font-semibold">Anordnung ändern</h4>
				<button class="btn btn-circle btn-ghost btn-sm" aria-label="Schließen"
					><FontAwesomeIcon icon={faXmark} /></button
				>
			</form>

			<div
				class="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2"
				use:dndzone={{ items, dropTargetStyle: {}, flipDurationMs: 200 }}
				onconsider={handleSort}
				onfinalize={finalize}
			>
				{#each items as item (item.id)}
					<div
						animate:flip={{ duration: 200 }}
						class="flex cursor-grab items-center rounded-xl border border-base-300 bg-base-200 px-4 py-3"
					>
						<p class="grow">{item.title}</p>
						<FontAwesomeIcon icon={faBars} class="opacity-50" />
					</div>
				{/each}
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
{/if}
