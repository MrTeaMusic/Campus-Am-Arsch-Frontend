<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import type { Writable } from 'svelte/store';
	import Portal from 'svelte-portal';

	import { type BasicUserData } from '$lib/types';
	import { persistentStore } from '$lib/TSHelpers/LocalStorageHelper';
	import { components, validateComponentOrder } from '$lib/TSHelpers/ComponentOrder.js';

	import PageContainer from '$lib/PageContainer.svelte';
	import BasicInfoTile from '$lib/TilesAndModals/BasicInfoTile.svelte';
	import CalendarTile from '$lib/TilesAndModals/CalendarTile.svelte';
	import ExamStatusTile from '$lib/TilesAndModals/ExamStatusTile.svelte';
	import GradesTile from '$lib/TilesAndModals/GradesTile.svelte';
	import MensaTile from '$lib/TilesAndModals/MensaTile.svelte';
	import DashReorderModal from '$lib/TilesAndModals/DashReorderModal.svelte';

	export let data;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const componentMap: Record<string, Component<any, any, any>> = {
		BasicInfoTile,
		GradesTile,
		CalendarTile,
		MensaTile,
		ExamStatusTile
	};

	let basicUserData: BasicUserData = JSON.parse(data.user_basic!);

	let componentOrder: Writable<string[]>;
	let componentProps: Record<string, object>;

	onMount(async () => {
		componentOrder = persistentStore('compOrder', components);
		if (!validateComponentOrder($componentOrder)) {
			console.error('Component order is fucked, resetting');
			componentOrder.set(components);
		}

		componentProps = {
			BasicInfoTile: { basicUserData }
		};
	});
</script>

<PageContainer>
	{#if basicUserData}
		<div class="mx-auto flex w-[94%] items-center space-x-1 sm:w-96 lg:w-[48.6rem]">
			<h1 class="grow text-3xl font-bold">
				Hallo, {basicUserData.first_name}.
			</h1>

			<DashReorderModal {componentOrder} />
		</div>
	{/if}
	{#if $componentOrder && componentProps}
		<div class="mx-auto grid w-[98%] grid-cols-1 gap-3 sm:w-auto lg:grid-cols-2">
			<!-- create portals -->
			{#each components as _, idx (idx)}
				<span class="contents" id="portal{idx}"></span>
			{/each}

			<!-- create tiles -->
			{#each components as component (component)}
				<Portal target="#portal{$componentOrder.indexOf(component)}">
					<svelte:component this={componentMap[component]} {...componentProps[component]} />
				</Portal>
			{/each}
		</div>
	{/if}
</PageContainer>
