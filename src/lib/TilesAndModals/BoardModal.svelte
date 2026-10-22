<script lang="ts">
	import DashboardModal from '$lib/DashboardModal.svelte';
	import type { BoardPost } from '$lib/types';
	import { toastError } from '$lib/stores/toast';
	import { formatPostTime } from '$lib/TSHelpers/SharedCalendarHelper';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faPaperPlane, faTrash } from '@fortawesome/free-solid-svg-icons';

	let {
		modal = $bindable<HTMLDialogElement | null>(null),
		posts,
		author,
		reload
	}: {
		modal: HTMLDialogElement | null;
		posts: BoardPost[];
		author: string;
		reload: () => Promise<void>;
	} = $props();

	let text = $state('');
	let sending = $state(false);

	async function send(body: object): Promise<boolean> {
		const res = await fetch('/api/board', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!res.ok) {
			toastError(await res.text());
			return false;
		}
		return true;
	}

	async function post(e: SubmitEvent) {
		e.preventDefault();
		sending = true;
		const ok = await send({ action: 'add', text, author });
		sending = false;
		if (ok) {
			text = '';
			await reload();
		}
	}

	async function remove(entry: BoardPost) {
		if (!confirm('Nachricht löschen?')) return;
		if (await send({ action: 'delete', id: entry.id })) await reload();
	}
</script>

<DashboardModal bind:modal title="Schwarzes Brett">
	<form class="mb-3 flex items-start gap-2" onsubmit={post}>
		<textarea
			class="textarea-bordered textarea w-full"
			rows="2"
			maxlength="500"
			required
			placeholder="Nachricht an alle …"
			bind:value={text}></textarea>
		<button
			class="btn btn-square btn-primary"
			type="submit"
			aria-label="Nachricht senden"
			disabled={sending}><FontAwesomeIcon icon={faPaperPlane} /></button
		>
	</form>

	{#if posts.length > 0}
		<div class="space-y-2">
			{#each posts as entry (entry.id)}
				<div class="card bg-base-200 shadow">
					<div class="card-body gap-1 p-4">
						<div class="flex items-start gap-2">
							<div class="min-w-0 grow">
								<p class="text-sm break-words whitespace-pre-line">{entry.text}</p>
								<div class="mt-1 text-xs opacity-60">
									{entry.author || 'Anonym'} · {formatPostTime(entry.created_at)}
								</div>
							</div>
							{#if entry.mine}
								<button
									class="btn btn-square btn-sm btn-accent"
									aria-label="Nachricht löschen"
									onclick={() => remove(entry)}><FontAwesomeIcon icon={faTrash} /></button
								>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-8 text-center">
			<p class="text-lg opacity-70">Noch keine Nachrichten. Schreib die erste!</p>
		</div>
	{/if}
</DashboardModal>
