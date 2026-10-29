<script lang="ts">
	import { untrack } from 'svelte';

	import { type CampusDualGrade } from '$lib/types';

	import DashboardModal from '$lib/DashboardModal.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faCalendar, faCoins, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

	let {
		grades,
		modal = $bindable<HTMLDialogElement | null>(null)
	}: { grades: Array<CampusDualGrade>; modal: HTMLDialogElement | null } = $props();

	// not yet graded modules and exams are shown as "?" or empty, those are left out
	const isGraded = (grade: string) => grade.trim() !== '' && grade.trim() !== '?';
	const gradedGrades = untrack(() => grades)
		.filter((item) => isGraded(item.grade))
		.map((item) => ({ ...item, subgrades: item.subgrades.filter((sub) => isGraded(sub.grade)) }));

	// only modules with an actual grade count (not yet graded ones are "?")
	const gradedModules = gradedGrades.filter(
		(item) => !Number.isNaN(parseFloat(item.grade.replace(',', '.'))) && item.credit_points > 0
	);
	const totalCps = gradedModules.reduce((sum, item) => sum + item.credit_points, 0);
	const weightedAverage =
		gradedModules.reduce((sum, item) => {
			return sum + parseFloat(item.grade.replace(',', '.')) * item.credit_points; // Convert string to number and add to sum
		}, 0) / totalCps;

	let filteredGrades: Array<CampusDualGrade> = $state(gradedGrades);

	let filter = $state('');
	let filterElement: HTMLInputElement;
	$effect(() => {
		filterGrades(filter);
	});

	// hack to emulate "autocollapse" while being able to collapse the remaining
	let accordionOpenIndex = $state(0);

	function filterGrades(filter: string) {
		accordionOpenIndex = 0;

		if (filter == '') {
			filteredGrades = gradedGrades;
		} else if (filter) {
			const words = filter.split(' ').map((word) => word.trim().toLowerCase());
			filteredGrades = gradedGrades.filter((grade) =>
				words.every((word) => grade.name.toLowerCase().includes(word))
			);
		}
	}
</script>

<svelte:window
	on:keydown={() => {
		filterElement?.focus();
	}}
/>

<DashboardModal bind:modal title="Noten">
	<div class="sticky -top-4 z-10 -mt-4 bg-base-100 pt-4 pb-2">
		<div class="flex items-center gap-2">
			<input
				bind:this={filterElement}
				bind:value={filter}
				class="input w-full bg-base-200 focus:bg-base-100"
				type="text"
				placeholder="Suchen..."
			/>
			<div class="tooltip tooltip-left">
				<div class="tooltip-content max-w-[200px]">
					Gewichteter Durchschnitt: ∑(Note ⋅ ECTS) / Gesamt-ECTS
				</div>
				<div class="badge h-10 p-2 badge-primary">
					<FontAwesomeIcon icon={faGraduationCap} />
					<span>
						{totalCps ? weightedAverage.toPrecision(3) : '...'}
					</span>
				</div>
			</div>
		</div>
	</div>

	{#if filteredGrades && filteredGrades.length > 0}
		<div class="space-y-2">
			{#each filteredGrades as grade, idx (grade)}
				<div class="collapse-arrow collapse border border-base-300 bg-base-100">
					<input
						type="checkbox"
						checked={idx === accordionOpenIndex}
						onchange={(e) => {
							accordionOpenIndex = e.currentTarget.checked ? idx : -1;
						}}
					/>

					<div class="collapse-title flex items-center gap-3">
						<span
							class="badge flex-none p-2 badge-md badge-soft font-bold {grade.total_passed ===
							undefined
								? 'badge-neutral'
								: grade.total_passed
									? 'badge-success'
									: 'badge-accent'}">{grade.grade}</span
						>
						<span class="text-sm font-bold">{grade.name}</span>
					</div>

					<div class="collapse-content space-y-4">
						<div class="card bg-base-200">
							<div class="card-body gap-4 p-4">
								<div class="flex items-center gap-3">
									<span class="badge size-7 badge-primary">
										<FontAwesomeIcon icon={faCalendar} />
									</span>
									<div>
										<div class="font-bold">{grade.akad_period}</div>
										<div class="text-sm opacity-60">Akademische Periode</div>
									</div>
								</div>

								<div class="flex items-center gap-3">
									<span class="badge size-7 badge-primary">
										<FontAwesomeIcon icon={faCoins} />
									</span>
									<div>
										<div class="font-bold">{grade.credit_points}</div>
										<div class="text-sm opacity-60">ECTS-Credits</div>
									</div>
								</div>
							</div>
						</div>

						<div class="card bg-base-200">
							<div class="card-body gap-3 p-4">
								{#each grade.subgrades as subgrade (subgrade)}
									<div class="flex items-center gap-3">
										<span
											class="badge flex-none p-2 font-mono badge-md badge-soft font-bold {subgrade.passed ===
											undefined
												? 'badge-neutral'
												: subgrade.passed
													? 'badge-success'
													: 'badge-accent'}">{subgrade.grade}</span
										>

										<div class="min-w-0 flex-auto">
											<div class="truncate text-sm">{subgrade.name}</div>
											<div class="text-sm opacity-60">
												{subgrade.wiederholung ? `${subgrade.wiederholung} ⋅ ` : ''}Bekanntgabe:
												{subgrade.bekanntgabe} ⋅ {subgrade.akad_period}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-8 text-center">
			<p class="text-lg opacity-70">Keine Noten gefunden.</p>
		</div>
	{/if}
</DashboardModal>
