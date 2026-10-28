<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';

	import type { ExamStats } from '$lib/types';

	export let stats: ExamStats;
	const hasData: boolean = Boolean(stats.successful || stats.unsuccessful || stats.unassessed);

	// get rgb value of css color
	// var(--color-primary)
	const getColor = (color: string) => {
		let colorVar = getComputedStyle(document.documentElement).getPropertyValue(color);
		return colorVar;
	};

	const chartData = {
		datasets: [
			{
				data: hasData ? [stats.successful, stats.unsuccessful, stats.unassessed] : [10, 1.5, 1],
				backgroundColor: [
					getColor('--color-primary'),
					getColor('--color-accent'),
					getColor('--color-base-300')
				],
				borderWidth: 0,
				borderRadius: 4,
				spacing: 2
			}
		]
	};

	Chart.register(DoughnutController, ArcElement, Tooltip);
	let pieChartElement: HTMLCanvasElement;

	onMount(() => {
		if (browser) {
			new Chart(pieChartElement, {
				type: 'doughnut',
				data: chartData,
				options: {
					cutout: '68%',
					plugins: {
						tooltip: hasData ? {} : { enabled: false }
					}
				}
			});
		}
	});
</script>

<div class="size-28 shrink-0 {hasData ? '' : 'opacity-75 grayscale'}">
	<canvas bind:this={pieChartElement}></canvas>
</div>
