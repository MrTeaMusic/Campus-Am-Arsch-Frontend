<script lang="ts">
	import DashboardTile from '$lib/DashboardTile.svelte';
	import { faUtensils } from '@fortawesome/free-solid-svg-icons';
	import MensaModal from './MensaModal.svelte';

	let modal: HTMLDialogElement | null = $state(null);
</script>

<MensaModal bind:modal></MensaModal>

<DashboardTile
	title="Mensa"
	icon={faUtensils}
	on:click={() => modal?.showModal()}
	ready={Boolean(modal)}
>
	<div class="flex w-full items-center gap-4 tile-box p-4 text-left">
		<span class="text-4xl" aria-hidden="true">🍝</span>
		<div>
			<p class="font-semibold">Was gibt's heute?</p>
			<p class="text-sm opacity-60">Tippe, um Gerichte anzuzeigen</p>
		</div>
	</div>
</DashboardTile>
