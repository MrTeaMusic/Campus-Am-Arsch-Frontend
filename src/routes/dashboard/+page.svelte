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
	import BoardTile from '$lib/TilesAndModals/BoardTile.svelte';
	import SlotMachineTile from '$lib/TilesAndModals/SlotMachineTile.svelte';
	import SharedCalendarTile from '$lib/TilesAndModals/SharedCalendarTile.svelte';
	import MensaTile from '$lib/TilesAndModals/MensaTile.svelte';
	import DashReorderModal from '$lib/TilesAndModals/DashReorderModal.svelte';

	export let data;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const componentMap: Record<string, Component<any, any, any>> = {
		BasicInfoTile,
		GradesTile,
		CalendarTile,
		SharedCalendarTile,
		MensaTile,
		ExamStatusTile,
		BoardTile,
		SlotMachineTile
	};

	let basicUserData: BasicUserData = JSON.parse(data.user_basic!);

	const today = new Date().toLocaleDateString('de-DE', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});

	let componentOrder: Writable<string[]>;
	let componentProps: Record<string, object>;

	onMount(async () => {
		componentOrder = persistentStore('compOrder', components);
		if (!validateComponentOrder($componentOrder)) {
			console.error('Component order is fucked, resetting');
			componentOrder.set(components);
		}

		componentProps = {
			BasicInfoTile: { basicUserData },
			SharedCalendarTile: { basicUserData },
			BoardTile: { basicUserData }
		};
	});
</script>

<PageContainer>
	{#if basicUserData}
		<div class="mx-auto flex w-[96%] items-end gap-3 pt-2 sm:w-96 lg:w-[48.75rem]">
			<div class="grow">
				<p class="text-sm font-medium opacity-60">{today}</p>
				<h1 class="text-3xl font-bold tracking-tight">
					Hallo, {basicUserData.first_name} 👋
				</h1>
			</div>

			<DashReorderModal {componentOrder} />
		</div>
	{/if}
	{#if $componentOrder && componentProps}
		<div class="mx-auto grid w-[96%] grid-cols-1 gap-3 sm:w-auto lg:grid-cols-2">
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
