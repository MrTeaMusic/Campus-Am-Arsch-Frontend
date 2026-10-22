<script lang="ts">
	import DashboardTile from '$lib/DashboardTile.svelte';
	import SharedCalendarModal from './SharedCalendarModal.svelte';
	import type { BasicUserData, SharedEvent } from '$lib/types';
	import { toastError } from '$lib/stores/toast';
	import { formatSharedTime, localDateTime } from '$lib/TSHelpers/SharedCalendarHelper';
	import { onMount } from 'svelte';

	let { basicUserData }: { basicUserData: BasicUserData } = $props();

	let modal: HTMLDialogElement | null = $state(null);
	let events = $state<SharedEvent[] | null>(null);

	async function load() {
		const res = await fetch(`/api/sharedcal?from=${encodeURIComponent(localDateTime(new Date()))}`);
		if (!res.ok) {
			toastError(await res.text());
			return;
		}
		events = await res.json();
	}

	onMount(load);
</script>

{#if events !== null}
	<SharedCalendarModal bind:modal {events} author={basicUserData.first_name} reload={load} />
{/if}

<DashboardTile
	title="Gemeinsamer Kalender"
	on:click={() => modal?.showModal()}
	ready={events !== null}
>
	{#if events && events.length > 0}
		<ul class="w-full space-y-2 py-2 text-left">
			{#each events.slice(0, 3) as event (event.id)}
				<li>
					<p class="truncate font-bold">{event.title}</p>
					<p class="text-sm opacity-70">{formatSharedTime(event.start, event.end)}</p>
				</li>
			{/each}
		</ul>
		{#if events.length > 3}
			<p class="text-xs opacity-60">und {events.length - 3} weitere</p>
		{/if}
	{:else}
		<p class="py-6 opacity-70">Noch keine Einträge. Tippe, um den ersten anzulegen.</p>
	{/if}
</DashboardTile>
