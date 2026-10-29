<script lang="ts">
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { CampusDualGrade, ExamStats } from '$lib/types';
	import { persistentStore } from '$lib/TSHelpers/LocalStorageHelper';
	import { toastError } from '$lib/stores/toast';
	import DashboardTile from '$lib/DashboardTile.svelte';
	import GradesModal from '$lib/TilesAndModals/GradesModal.svelte';
	import PieChart from '$lib/Grades/PieChart.svelte';
	import ChartLabel from '$lib/Grades/ChartLabel.svelte';
	import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';

	let modal: HTMLDialogElement | null = null;

	let stats: ExamStats;
	let grades: Array<CampusDualGrade>;
	let gradesCountStore: Writable<number>;
	let total: number;

	onMount(async () => {
		const res1 = await fetch('/api/examstats');

		if (!res1.ok) {
			toastError(await res1.text());
			return;
		}
		stats = await res1.json();
		total = stats.successful + stats.unsuccessful + stats.unassessed;

		const res2 = await fetch('/api/grades');
		if (res2.ok) {
			grades = await res2.json();
			// always show "new grades" on first use
			gradesCountStore = persistentStore('gradesCount', 0);
		} else {
			toastError(await res2.text());
		}
	});

	function openModal() {
		if (!modal) return;
		gradesCountStore.set(grades.length);
		modal.showModal();
	}
</script>

{#if grades !== undefined}
	<GradesModal bind:modal {grades}></GradesModal>
{/if}

<DashboardTile
	title="Noten"
	icon={faGraduationCap}
	on:click={openModal}
	ready={Boolean(stats && grades)}
>
	<div class="flex h-full w-full flex-col justify-center gap-3">
		{#if $gradesCountStore != grades.length}
			<div class="flex w-full">
				<span class="badge badge-sm font-semibold badge-primary">Neue Noten</span>
			</div>
		{/if}
		<div class="flex w-full items-center justify-center gap-5">
			<PieChart {stats} />
			{#if !(stats.successful || stats.unsuccessful || stats.unassessed)}
				<p class="text-sm opacity-70">Es gibt noch keine Einträge.</p>
			{:else}
				<ul class="flex flex-col gap-1 text-left text-sm">
					{#if stats.successful > 0}
						<ChartLabel
							label="Erfolg"
							value={stats.successful}
							{total}
							color="var(--color-primary)"
						/>
					{/if}
					{#if stats.unsuccessful > 0}
						<ChartLabel
							label="5.0 Abfahrt"
							value={stats.unsuccessful}
							{total}
							color="var(--color-accent)"
						/>
					{/if}
					{#if stats.unassessed > 0}
						<ChartLabel
							label="Ausstehend"
							value={stats.unassessed}
							{total}
							color="var(--color-base-300)"
						/>
					{/if}
				</ul>
			{/if}
		</div>
	</div>
</DashboardTile>
