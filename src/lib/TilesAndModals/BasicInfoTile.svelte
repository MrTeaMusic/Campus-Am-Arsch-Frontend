<script lang="ts">
	import { onMount } from 'svelte';

	import DashboardTile from '$lib/DashboardTile.svelte';
	import type { BasicUserData } from '$lib/types';
	import { toastError } from '$lib/stores/toast';

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
	clickable={false}
	ready={Boolean(basicUserData && fachsemester != undefined && ects != undefined)}
>
	<div class="flex h-full max-h-44 min-h-32 w-full flex-col justify-between space-y-2">
		<div class="grow"></div>
		{#if basicUserData}
			{#if basicUserData.seminar_group}
				<p>{basicUserData.user} - {basicUserData.seminar_group}</p>
				<p>{basicUserData.seminar_name}</p>
			{:else}
				<p>{basicUserData.user}</p>
				<div class="m-4 flex items-center space-x-2">
					<i class="fa-solid fa-info-circle"></i>
					<p class="text-sm">
						Anscheinend hast du keine Seminargruppe. Das ist normal wenn das Studium vorbei ist
					</p>
				</div>
			{/if}
		{/if}
		<div class="grow"></div>
		<details class="dropdown" on:toggle={loadDocuments}>
			<summary class="btn btn-sm btn-outline">
				<i class="fa-solid fa-file-arrow-down"></i>
				Studentendokumente
			</summary>
			<ul class="menu dropdown-content rounded-box bg-base-200 z-10 w-72 p-2 shadow">
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
		{#if fachsemester != undefined && ects != undefined}
			<div class="divider"></div>
			<div class="flex space-x-4 px-1 pb-1">
				<div class="flex w-full flex-col justify-center space-y-2">
					<small id="fachsem">Fachsemester: {fachsemester}</small>
					<progress class="progress progress-primary" value={parseInt(fachsemester)} max={6}
					></progress>
				</div>
				<div class="flex w-full flex-col justify-center space-y-2">
					<small id="ects">ECTS: {ects} / 180</small>
					<progress class="progress progress-accent" value={parseInt(ects)} max={180}></progress>
				</div>
			</div>
		{/if}
	</div>
</DashboardTile>
