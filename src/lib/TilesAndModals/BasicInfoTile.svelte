<script lang="ts">
	import { onMount } from 'svelte';

	import DashboardTile from '$lib/DashboardTile.svelte';
	import type { BasicUserData } from '$lib/types';
	import { toastError } from '$lib/stores/toast';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faCircleInfo, faFileArrowDown, faUser } from '@fortawesome/free-solid-svg-icons';

	export let basicUserData: BasicUserData;

	let fachsemester: string;
	let ects: string;

	let documents: { id: string; title: string }[] | undefined;
	let downloadingId: string | undefined;

	async function loadDocuments() {
		if (documents) return;
		const res = await fetch('/api/studentdocuments');
		if (res.ok) {
			documents = await res.json();
		} else {
			toastError(await res.text());
		}
	}

	async function download(id: string) {
		downloadingId = id;
		try {
			const res = await fetch(`/api/studentdocuments/document?id=${encodeURIComponent(id)}`);
			if (!res.ok) {
				toastError(await res.text());
				return;
			}
			const filename =
				res.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1] ??
				'Dokument.pdf';
			const url = URL.createObjectURL(await res.blob());
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 10_000);
		} catch {
			toastError('Fehler beim Abruf des Dokuments');
		} finally {
			downloadingId = undefined;
		}
	}

	onMount(async () => {
		const res1 = await fetch('/api/getects');

		if (res1.ok) {
			ects = await res1.json();
		} else {
			toastError(await res1.text());
		}

		const res2 = await fetch('/api/getfachsem');

		if (res2.ok) {
			fachsemester = await res2.text();
		} else {
			toastError(await res2.text());
		}
	});
</script>

<DashboardTile
	title="Deine Infos"
	icon={faUser}
	clickable={false}
	ready={Boolean(basicUserData && fachsemester != undefined && ects != undefined)}
>
	<div class="flex h-full w-full flex-col gap-3 text-left">
		{#if basicUserData}
			<div class="flex items-center gap-3">
				<div
					class="grid size-12 shrink-0 place-content-center rounded-full bg-linear-to-br from-primary to-secondary text-lg font-bold text-primary-content"
					aria-hidden="true"
				>
					{(basicUserData.first_name?.[0] ?? '') + (basicUserData.last_name?.[0] ?? '')}
				</div>
				<div class="min-w-0">
					<p class="truncate font-semibold">
						{basicUserData.first_name}
						{basicUserData.last_name}
					</p>
					{#if basicUserData.seminar_group}
						<p class="truncate text-sm opacity-60">
							{basicUserData.user} · {basicUserData.seminar_group}
						</p>
						<p class="truncate text-sm opacity-60">{basicUserData.seminar_name}</p>
					{:else}
						<p class="truncate text-sm opacity-60">{basicUserData.user}</p>
					{/if}
				</div>
			</div>
			{#if !basicUserData.seminar_group}
				<div class="flex items-center gap-2 tile-box p-3">
					<FontAwesomeIcon icon={faCircleInfo} class="opacity-60" />
					<p class="text-sm">
						Anscheinend hast du keine Seminargruppe. Das ist normal wenn das Studium vorbei ist
					</p>
				</div>
			{/if}
		{/if}
		{#if fachsemester != undefined && ects != undefined}
			<div class="grid grid-cols-2 gap-2">
				<div class="tile-box p-3">
					<p class="text-xs font-medium opacity-60" id="fachsem">Fachsemester</p>
					<p class="text-xl font-bold">
						{fachsemester}<span class="text-sm font-medium opacity-50"> / 6</span>
					</p>
					<progress
						class="progress mt-1 h-1.5 progress-primary"
						aria-labelledby="fachsem"
						value={parseInt(fachsemester)}
						max={6}
					></progress>
				</div>
				<div class="tile-box p-3">
					<p class="text-xs font-medium opacity-60" id="ects">ECTS</p>
					<p class="text-xl font-bold">
						{ects}<span class="text-sm font-medium opacity-50"> / 180</span>
					</p>
					<progress
						class="progress mt-1 h-1.5 progress-secondary"
						aria-labelledby="ects"
						value={parseInt(ects)}
						max={180}
					></progress>
				</div>
			</div>
		{/if}
		<details class="dropdown w-full" on:toggle={loadDocuments}>
			<summary class="btn w-full btn-soft btn-sm btn-primary">
				<FontAwesomeIcon icon={faFileArrowDown} />
				Studentendokumente
			</summary>
			<ul
				class="menu dropdown-content z-10 mt-1 w-full rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
			>
				{#if documents == undefined}
					<li class="disabled"><span class="loading loading-dots loading-sm"></span></li>
				{:else if documents.length == 0}
					<li class="disabled"><span>Keine Dokumente verfügbar</span></li>
				{:else}
					{#each documents as doc (doc.id)}
						<li>
							<button disabled={downloadingId != undefined} on:click={() => download(doc.id)}>
								{#if downloadingId == doc.id}
									<span class="loading loading-spinner loading-xs"></span>
								{/if}
								{doc.title}
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		</details>
	</div>
</DashboardTile>
