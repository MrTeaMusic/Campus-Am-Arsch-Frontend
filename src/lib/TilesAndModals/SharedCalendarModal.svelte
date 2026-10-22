<script lang="ts">
	import DashboardModal from '$lib/DashboardModal.svelte';
	import type { SharedEvent } from '$lib/types';
	import { toastError } from '$lib/stores/toast';
	import { formatSharedTime, localDateTime } from '$lib/TSHelpers/SharedCalendarHelper';
	import { disablePush, enablePush, getPushState, type PushState } from '$lib/TSHelpers/PushHelper';
	import { onMount } from 'svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

	let {
		modal = $bindable<HTMLDialogElement | null>(null),
		events,
		author,
		reload
	}: {
		modal: HTMLDialogElement | null;
		events: SharedEvent[];
		author: string;
		reload: () => Promise<void>;
	} = $props();

	// null: the form is closed, 0: a new entry, otherwise the id of the entry that is edited
	let editing = $state<number | null>(null);
	let title = $state('');
	let description = $state('');
	let start = $state('');
	let end = $state('');
	let saving = $state(false);

	function openForm(event?: SharedEvent) {
		editing = event?.id ?? 0;
		title = event?.title ?? '';
		description = event?.description ?? '';
		start = event?.start ?? localDateTime(new Date());
		end = event?.end ?? localDateTime(new Date(Date.now() + 60 * 60 * 1000));
	}

	async function send(body: object): Promise<boolean> {
		const res = await fetch('/api/sharedcal', {
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

	async function save(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		const entry = { title, description, start, end, author };
		const ok = await send(
			editing ? { action: 'update', id: editing, ...entry } : { action: 'add', ...entry }
		);
		saving = false;
		if (ok) {
			editing = null;
			await reload();
		}
	}

	let pushState = $state<PushState | null>(null);
	let pushBusy = $state(false);

	onMount(async () => {
		pushState = await getPushState();
	});

	async function togglePush() {
		pushBusy = true;
		try {
			if (pushState === 'on') await disablePush();
			else await enablePush();
		} catch (e) {
			toastError(e instanceof Error ? e.message : 'Benachrichtigungen nicht möglich');
		}
		pushState = await getPushState();
		pushBusy = false;
	}

	async function remove(event: SharedEvent) {
		if (!confirm(`„${event.title}“ löschen?`)) return;
		if (await send({ action: 'delete', id: event.id })) await reload();
	}
</script>

<DashboardModal bind:modal title="Gemeinsamer Kalender">
	{#if editing === null}
		<button class="btn mb-3 btn-primary" onclick={() => openForm()}>
			<FontAwesomeIcon icon={faPlus} /> Neuer Eintrag
		</button>

		{#if pushState === 'on' || pushState === 'off'}
			<label class="mb-3 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					class="toggle toggle-primary"
					checked={pushState === 'on'}
					disabled={pushBusy}
					onchange={togglePush}
				/>
				<span class="text-sm">Erinnerung einen Tag vorher aufs Gerät</span>
			</label>
		{:else if pushState === 'needs-install'}
			<p class="mb-3 text-sm opacity-70">
				Für Erinnerungen auf dem iPhone: in Safari auf Teilen tippen, „Zum Home-Bildschirm“ wählen
				und die App von dort öffnen.
			</p>
		{:else if pushState === 'blocked'}
			<p class="mb-3 text-sm opacity-70">
				Benachrichtigungen sind für diese Seite blockiert. Erlaube sie in den Browser- oder
				Systemeinstellungen, dann kannst du Erinnerungen einschalten.
			</p>
		{/if}

		{#if events.length > 0}
			<div class="space-y-2">
				{#each events as event (event.id)}
					<div class="card bg-base-200 shadow">
						<div class="card-body gap-1 p-4">
							<div class="flex items-start gap-2">
								<div class="min-w-0 grow">
									<div class="font-bold">{event.title}</div>
									<div class="text-sm opacity-70">{formatSharedTime(event.start, event.end)}</div>
									{#if event.description}
										<p class="mt-1 text-sm whitespace-pre-line">{event.description}</p>
									{/if}
									{#if event.author}
										<div class="mt-1 text-xs opacity-60">von {event.author}</div>
									{/if}
								</div>
								{#if event.mine}
									<button
										class="btn btn-square btn-sm btn-primary"
										aria-label="Eintrag bearbeiten"
										onclick={() => openForm(event)}><FontAwesomeIcon icon={faPen} /></button
									>
									<button
										class="btn btn-square btn-sm btn-accent"
										aria-label="Eintrag löschen"
										onclick={() => remove(event)}><FontAwesomeIcon icon={faTrash} /></button
									>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-8 text-center">
				<p class="text-lg opacity-70">Noch keine Einträge. Lege den ersten an!</p>
			</div>
		{/if}
	{:else}
		<form class="space-y-3" onsubmit={save}>
			<label class="floating-label">
				<span>Titel</span>
				<input
					class="input-bordered input w-full"
					type="text"
					maxlength="100"
					required
					placeholder="Titel"
					bind:value={title}
				/>
			</label>
			<label class="floating-label">
				<span>Beginn</span>
				<input
					class="input-bordered input w-full"
					type="datetime-local"
					required
					bind:value={start}
				/>
			</label>
			<label class="floating-label">
				<span>Ende</span>
				<input
					class="input-bordered input w-full"
					type="datetime-local"
					required
					bind:value={end}
				/>
			</label>
			<label class="floating-label">
				<span>Beschreibung (optional)</span>
				<textarea
					class="textarea-bordered textarea w-full"
					maxlength="500"
					rows="3"
					placeholder="Beschreibung (optional)"
					bind:value={description}></textarea>
			</label>
			<div class="flex gap-2">
				<button class="btn btn-primary" type="submit" disabled={saving}>Speichern</button>
				<button class="btn" type="button" onclick={() => (editing = null)}>Abbrechen</button>
			</div>
		</form>
	{/if}
</DashboardModal>
