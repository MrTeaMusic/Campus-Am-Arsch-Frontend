<script lang="ts">
	import DashboardModal from '$lib/DashboardModal.svelte';
	import MealView from '$lib/Mensa/MealView.svelte';
	import { fetchMeals, fetchOpenMeals } from '$lib/Mensa/MensaFuncs';
	import MensaSelector from '$lib/Mensa/MensaSelector.svelte';
	import { toastError } from '$lib/stores/toast';
	import type { MealGroup, MensaSelectorEvent } from '$lib/types';
	import type { SvelteDate } from 'svelte/reactivity';

	let mealGroups: Array<MealGroup> | undefined = $state();

	let {
		modal = $bindable<HTMLDialogElement | null>(null)
	}: {
		modal: HTMLDialogElement | null;
	} = $props();

	// responses can arrive out of order when switching quickly: only the latest request may win
	let latestRequest = 0;

	async function handleMealsFetch(
		date: SvelteDate,
		canteenId: number
	): Promise<MealGroup[] | undefined> {
		try {
			if (canteenId > 0) {
				return await fetchMeals(date, canteenId);
			} else {
				return await fetchOpenMeals(date, canteenId * -1);
			}
		} catch (e) {
			toastError(e instanceof Error ? e.message : String(e));
		}
	}

	async function handleSelectChange(e: CustomEvent<MensaSelectorEvent>) {
		if (!e.detail) return;

		const request = ++latestRequest;
		const meals = await handleMealsFetch(e.detail.date, e.detail.canteenId);
		if (request === latestRequest) {
			mealGroups = meals;
		}
	}
</script>

<DashboardModal bind:modal title="Mensa">
	<div class="sticky -top-4 z-10 -mt-4 bg-base-100 pt-4">
		<MensaSelector on:selectChanged={handleSelectChange} />
	</div>

	{#if mealGroups}
		<MealView {mealGroups} />
	{/if}
</DashboardModal>
