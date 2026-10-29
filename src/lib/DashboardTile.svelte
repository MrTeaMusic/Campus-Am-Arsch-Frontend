<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import TileInteractiveElementWrapper from './TilesAndModals/TileInteractiveElementWrapper.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import {
		faCheck,
		faChevronRight,
		faRotateRight,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';

	export let title: string;
	export let icon: IconDefinition | undefined = undefined;
	export let clickable: boolean = true;
	export let reloadable: boolean = false;
	export let reloading: boolean = false;
	export let ready: boolean = false;

	const dispatch = createEventDispatcher();
	let pointerPressed = false;

	function hasParentWithClass(element: HTMLElement, classname: string): boolean {
		let currentElement: HTMLElement | null = element;

		while (currentElement) {
			if (currentElement.classList.contains(classname)) {
				return true;
			}
			currentElement = currentElement.parentElement;
		}

		return false;
	}

	function handlePointerStart(e: PointerEvent) {
		let target = e.target as HTMLElement;
		if (
			!(clickable && ready) ||
			(hasParentWithClass(target, 'dont-open-modal') &&
				!hasParentWithClass(target, 'override-open-modal'))
		) {
			return;
		}

		pointerPressed = true;
		window.addEventListener('pointercancel', handlePointerEnd);
		window.addEventListener('pointerup', handlePointerEnd);
	}

	function handlePointerEnd() {
		pointerPressed = false;
		window.removeEventListener('pointercancel', handlePointerEnd);
		window.removeEventListener('pointerup', handlePointerEnd);
	}
</script>

<!-- not clickable tiles must not be a (disabled) button, or their own buttons and links stop working -->
<svelte:element
	this={clickable ? 'button' : 'div'}
	on:click={() => {
		if (ready) dispatch('click');
	}}
	on:pointerdown={handlePointerStart}
	aria-label={clickable ? title : undefined}
	role={clickable ? undefined : 'group'}
	class="{pointerPressed
		? 'scale-[98%]'
		: ''} tile flex h-full w-full flex-col items-center gap-2 rounded-box border p-4 text-base-content transition-transform sm:w-96 {clickable &&
	ready
		? 'cursor-pointer'
		: ''}"
>
	<div class="tile-head flex w-full flex-row items-center gap-3">
		{#if icon}
			<span
				class="tile-icon grid size-9 shrink-0 place-content-center rounded-xl"
				aria-hidden="true"
			>
				<FontAwesomeIcon {icon} />
			</span>
		{/if}
		<header class="tile-title grow text-left text-lg font-semibold tracking-tight">{title}</header>
		{#if reloadable}
			<TileInteractiveElementWrapper>
				{#if reloading}
					<span class="loading loading-sm loading-dots opacity-60"></span>
				{:else}
					<button
						on:click={() => dispatch('reload')}
						class="group grid size-8 place-content-center rounded-full text-sm opacity-60 hover:cursor-pointer hover:bg-base-200 hover:opacity-100"
						aria-label="Daten neu laden"
					>
						<span class="block group-hover:hidden">
							<FontAwesomeIcon icon={faCheck} class="block group-hover:hidden" />
						</span>
						<span class="hidden group-hover:block">
							<FontAwesomeIcon icon={faRotateRight} class="hidden group-hover:block" />
						</span>
					</button>
				{/if}
			</TileInteractiveElementWrapper>
		{/if}
		{#if clickable}
			<span class="text-sm opacity-40" aria-hidden="true">
				<FontAwesomeIcon icon={faChevronRight} />
			</span>
		{/if}
	</div>
	{#if ready}
		<slot name="header" />
	{/if}

	<div class="tile-body flex h-full w-full flex-col items-center">
		{#if ready}
			<slot />
		{:else}
			<span class="loading h-42 loading-lg loading-dots opacity-40"></span>
		{/if}
	</div>

	{#if ready}
		<TileInteractiveElementWrapper>
			<slot name="footer" />
		</TileInteractiveElementWrapper>
	{/if}
</svelte:element>
