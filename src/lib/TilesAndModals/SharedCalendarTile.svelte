<script lang="ts">
	import DashboardTile from '$lib/DashboardTile.svelte';
	import SharedCalendarModal from './SharedCalendarModal.svelte';
	import type { BasicUserData } from '$lib/types';
	import { formatSharedTime } from '$lib/TSHelpers/SharedCalendarHelper';
	import { loadSharedEvents, sharedEvents } from '$lib/stores/sharedEvents';
	import { onMount } from 'svelte';
	import { faUserGroup } from '@fortawesome/free-solid-svg-icons';

	let { basicUserData }: { basicUserData: BasicUserData } = $props();

	let modal: HTMLDialogElement | null = $state(null);
	// the entries of the past weeks are only shown in the timetable calendar
	let events = $derived(
		$sharedEvents && $sharedEvents.filter((event) => new Date(event.end) >= new Date())
	);

	onMount(loadSharedEvents);
</script>

{#if events !== null}
	<SharedCalendarModal
		bind:modal
		{events}
		author={basicUserData.first_name}
		reload={loadSharedEvents}
	/>
{/if}

<DashboardTile
	title="Gemeinsamer Kalender"
	icon={faUserGroup}
	on:click={() => modal?.showModal()}
	ready={events !== null}
>
	{#if events && events.length > 0}
		<ul class="flex w-full flex-col gap-2 text-left">
			{#each events.slice(0, 3) as event (event.id)}
				<li class="flex items-center gap-3 tile-box px-3 py-2">
					<span class="h-8 w-1 shrink-0 rounded-full bg-secondary"></span>
					<div class="min-w-0">
						<p class="truncate font-semibold">{event.title}</p>
						<p class="text-sm opacity-60">{formatSharedTime(event.start, event.end)}</p>
					</div>
				</li>
			{/each}
		</ul>
		{#if events.length > 3}
			<p class="w-full text-left text-xs opacity-60">und {events.length - 3} weitere</p>
		{/if}
	{:else}
		<p class="py-6 text-sm opacity-60">Noch keine Einträge. Tippe, um den ersten anzulegen.</p>
	{/if}
</DashboardTile>
