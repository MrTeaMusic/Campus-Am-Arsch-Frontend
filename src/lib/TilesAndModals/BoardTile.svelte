<script lang="ts">
	import DashboardTile from '$lib/DashboardTile.svelte';
	import BoardModal from './BoardModal.svelte';
	import type { BasicUserData, BoardPost } from '$lib/types';
	import { toastError } from '$lib/stores/toast';
	import { formatPostTime } from '$lib/TSHelpers/SharedCalendarHelper';
	import { onMount } from 'svelte';
	import { faThumbtack } from '@fortawesome/free-solid-svg-icons';

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

<DashboardTile
	title="Schwarzes Brett"
	icon={faThumbtack}
	on:click={() => modal?.showModal()}
	ready={posts !== null}
>
	{#if posts && posts.length > 0}
		<ul class="flex w-full flex-col gap-2 text-left">
			{#each posts.slice(0, 2) as entry (entry.id)}
				<li class="rounded-xl bg-base-200 px-3 py-2">
					<p class="line-clamp-2 text-sm break-words">{entry.text}</p>
					<p class="mt-1 text-xs opacity-60">
						<span class="font-semibold">{entry.author || 'Anonym'}</span> · {formatPostTime(
							entry.created_at
						)}
					</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="py-6 text-sm opacity-60">Noch keine Nachrichten. Tippe, um die erste zu schreiben.</p>
	{/if}
</DashboardTile>
