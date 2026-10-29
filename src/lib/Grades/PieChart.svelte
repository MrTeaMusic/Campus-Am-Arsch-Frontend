<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';

	import type { ExamStats } from '$lib/types';
	import { APPEARANCE_EVENT } from '$lib/TSHelpers/Appearance';

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
			const chart = new Chart(pieChartElement, {
				type: 'doughnut',
				data: chartData,
				options: {
					cutout: '68%',
					plugins: {
						tooltip: hasData ? {} : { enabled: false }
					}
				}
			});

			// the chart paints with fixed colors, so repaint it when another app color is chosen
			const recolor = () => {
				chart.data.datasets[0].backgroundColor = [
					getColor('--color-primary'),
					getColor('--color-accent'),
					getColor('--color-base-300')
				];
				chart.update();
			};
			window.addEventListener(APPEARANCE_EVENT, recolor);
			return () => {
				window.removeEventListener(APPEARANCE_EVENT, recolor);
				chart.destroy();
			};
		}
	});
</script>

<div class="size-28 shrink-0 {hasData ? '' : 'opacity-75 grayscale'}">
	<canvas bind:this={pieChartElement}></canvas>
</div>
