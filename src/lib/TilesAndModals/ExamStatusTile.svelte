<script lang="ts">
	import DashboardTile from '$lib/DashboardTile.svelte';
	import type { ExamRegStatus } from '$lib/types';
	import { toastError } from '$lib/stores/toast';
	import { onMount } from 'svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faSquareCheck, faSquarePen } from '@fortawesome/free-solid-svg-icons';

	let status = $state<ExamRegStatus | null>(null);

	onMount(async () => {
		const res = await fetch('/api/examreg');

		if (!res.ok) {
			toastError(await res.text());
			return;
		}
		status = await res.json();
	});

	let current = $derived(status?.periods.filter((p) => p.current) ?? []);
</script>

<DashboardTile title="Prüfungen" clickable={false} ready={status !== null}>
	{#if status}
		<div class="flex items-center py-4">
			<div class="flex flex-col">
				{#if status.open}
					<FontAwesomeIcon class="text-accent" size="2xl" icon={faSquarePen} />
				{:else}
					<FontAwesomeIcon class="text-primary" size="2xl" icon={faSquareCheck} />
				{/if}
			</div>
			<div class="ml-1 h-full border-l border-base-300 pr-3"></div>
			<div class="text-left">
				Prüfungsanmeldung
				<p class="font-bold">{status.open ? 'möglich' : 'nicht möglich'}</p>
				{#each current as period (period.peryr + period.perid)}
					<p class="text-xs opacity-60">
						{period.peryr}/{period.perid}: {period.offers} Angebote, {period.booked} gebucht
					</p>
				{/each}
			</div>
		</div>
	{/if}
</DashboardTile>
