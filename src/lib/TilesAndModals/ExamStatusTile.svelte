<script lang="ts">
	import DashboardTile from '$lib/DashboardTile.svelte';
	import type { ExamRegStatus } from '$lib/types';
	import { toastError } from '$lib/stores/toast';
	import { onMount } from 'svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faCircleCheck, faFilePen, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

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

<DashboardTile title="Prüfungen" icon={faFilePen} clickable={false} ready={status !== null}>
	{#if status}
		<div class="flex w-full items-center gap-4 tile-box p-4 text-left">
			<span
				class="grid size-11 shrink-0 place-content-center rounded-full text-lg {status.open
					? 'bg-success/15 text-success'
					: 'bg-base-300 opacity-70'}"
			>
				<FontAwesomeIcon icon={status.open ? faPenToSquare : faCircleCheck} />
			</span>
			<div class="min-w-0">
				<p class="text-sm opacity-60">Prüfungsanmeldung</p>
				<p class="font-semibold">{status.open ? 'möglich' : 'nicht möglich'}</p>
				{#each current as period (period.peryr + period.perid)}
					<p class="text-xs opacity-60">
						{period.peryr}/{period.perid}: {period.offers} Angebote, {period.booked} gebucht
					</p>
				{/each}
			</div>
		</div>
	{/if}
</DashboardTile>
