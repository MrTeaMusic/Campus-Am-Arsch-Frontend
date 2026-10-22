<script lang="ts">
	import DashboardTile from '$lib/DashboardTile.svelte';
	import BoardModal from './BoardModal.svelte';
	import type { BasicUserData, BoardPost } from '$lib/types';
	import { toastError } from '$lib/stores/toast';
	import { formatPostTime } from '$lib/TSHelpers/SharedCalendarHelper';
	import { onMount } from 'svelte';

	let { basicUserData }: { basicUserData: BasicUserData } = $props();

	let modal: HTMLDialogElement | null = $state(null);
	let posts = $state<BoardPost[] | null>(null);

	async function load() {
		const res = await fetch('/api/board');
		if (!res.ok) {
			toastError(await res.text());
			return;
		}
		posts = await res.json();
	}

	onMount(load);
</script>

{#if posts !== null}
	<BoardModal bind:modal {posts} author={basicUserData.first_name} reload={load} />
{/if}

<DashboardTile title="Schwarzes Brett" on:click={() => modal?.showModal()} ready={posts !== null}>
	{#if posts && posts.length > 0}
		<ul class="w-full space-y-2 py-2 text-left">
			{#each posts.slice(0, 2) as entry (entry.id)}
				<li>
					<p class="line-clamp-2 text-sm break-words">{entry.text}</p>
					<p class="text-xs opacity-60">
						{entry.author || 'Anonym'} · {formatPostTime(entry.created_at)}
					</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="py-6 opacity-70">Noch keine Nachrichten. Tippe, um die erste zu schreiben.</p>
	{/if}
</DashboardTile>
