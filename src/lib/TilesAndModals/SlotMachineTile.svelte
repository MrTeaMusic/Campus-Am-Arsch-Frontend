<script lang="ts">
	import DashboardTile from '$lib/DashboardTile.svelte';
	import { onDestroy } from 'svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faDesktop, faDiceFive, faMobileScreen } from '@fortawesome/free-solid-svg-icons';

	const GAMES_URL = 'https://mondschein-arcade.kevinkevin67.workers.dev';
	const GAMES_MOBILE_URL = 'https://kevin67.de';
	const UNI = '📚';
	const HOME = '🛏️';
	const BEER = '🍺';
	const symbols = [UNI, HOME, BEER];

	let reels = $state([UNI, HOME, BEER]);
	let spinning = $state(false);
	let verdict = $state('');
	let timers: ReturnType<typeof setInterval>[] = [];

	function randomSymbol() {
		return symbols[Math.floor(Math.random() * symbols.length)];
	}

	function decide(result: string[]): string {
		const count = (s: string) => result.filter((r) => r === s).length;
		if (count(UNI) >= 2) return 'Ab zur Uni!';
		if (count(HOME) >= 2) return 'Bleib heute zu Hause.';
		if (count(BEER) >= 2) return 'Erst mal ein Bier, Uni kann warten.';
		return 'Unentschieden. Dreh nochmal!';
	}

	function spin() {
		if (spinning) return;
		spinning = true;
		verdict = '';
		const final = [randomSymbol(), randomSymbol(), randomSymbol()];

		reels.forEach((_, i) => {
			const timer = setInterval(() => (reels[i] = randomSymbol()), 80);
			timers.push(timer);
			setTimeout(
				() => {
					clearInterval(timer);
					reels[i] = final[i];
					if (i === reels.length - 1) {
						spinning = false;
						verdict = decide(final);
					}
				},
				800 + i * 500
			);
		});
	}

	onDestroy(() => timers.forEach(clearInterval));
</script>

<DashboardTile title="Uni oder nicht?" icon={faDiceFive} clickable={false} ready={true}>
	<div class="flex w-full flex-col items-center gap-3">
		<div class="flex gap-2 tile-box p-3 text-4xl">
			{#each reels as symbol, i (i)}
				<span
					class="w-16 rounded-lg bg-base-100 py-2 text-center shadow-sm"
					class:animate-pulse={spinning}
				>
					{symbol}
				</span>
			{/each}
		</div>
		<p class="min-h-6 font-bold">{verdict}</p>
		<button class="btn w-full btn-sm btn-primary" onclick={spin} disabled={spinning}>
			{spinning ? 'Dreht …' : 'Drehen'}
		</button>
		<div class="w-full">
			<p class="mb-1.5 text-left text-xs font-medium opacity-60">Zu den Games</p>
			<div class="flex w-full gap-2">
				<a
					class="btn flex-1 btn-soft btn-sm btn-primary"
					href={GAMES_URL}
					target="_blank"
					rel="noopener noreferrer"
				>
					<FontAwesomeIcon icon={faDesktop} />
					PC-Version
				</a>
				<a
					class="btn flex-1 btn-soft btn-sm btn-primary"
					href={GAMES_MOBILE_URL}
					target="_blank"
					rel="noopener noreferrer"
				>
					<FontAwesomeIcon icon={faMobileScreen} />
					Handy-Version
				</a>
			</div>
		</div>
	</div>
</DashboardTile>
