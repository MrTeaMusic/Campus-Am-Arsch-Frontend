<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import {
		faBug,
		faCircleInfo,
		faScaleBalanced,
		faRightFromBracket,
		faUpRightFromSquare
	} from '@fortawesome/free-solid-svg-icons';
	import { faGithub } from '@fortawesome/free-brands-svg-icons';
	import SettingsModal from './SettingsModal.svelte';

	const version = `Build ${__APP_BUILD__} · ${__APP_COMMIT__}`;
	const builtAt = new Date(__APP_BUILT_AT__).toLocaleString('de-DE');
</script>

<!-- Obere Navigationsleiste; Padding oben respektiert Safe-Area-Inset für nicht-eckige Bildschirme -->
<nav
	class="sticky top-0 z-50 flex h-[calc(env(safe-area-inset-top,0px)+4rem)] items-center justify-between
	border-b border-b-base-300/70 bg-base-100/80 px-4 pt-[env(safe-area-inset-top,0px)] backdrop-blur-lg select-none"
>
	<!-- <div class="w-24 dark:brightness-90 dark:invert dark:saturate-0">
		<Logo />
	</div> -->
	<div class="flex min-w-0 items-center gap-3">
		<img
			src="/apple-touch-icon.png"
			alt=""
			class="size-9 shrink-0 rounded-xl shadow-sm ring-1 ring-base-300"
			width="36"
			height="36"
		/>
		<div class="flex min-w-0 flex-col leading-tight">
			<p class="truncate text-lg font-bold tracking-tight">Campus am Arsch</p>
			<p class="truncate font-mono text-[10px] opacity-50" title="Gebaut am {builtAt}">{version}</p>
		</div>
	</div>
	<div class="flex flex-row items-center gap-1">
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" aria-label="Info" class="btn btn-circle btn-ghost btn-sm">
				<FontAwesomeIcon icon={faCircleInfo} class="text-base opacity-70" />
			</div>
			<div
				tabindex="-1"
				class="dropdown-content card z-1 mt-2 w-52 rounded-box border border-base-300 bg-base-100 shadow-xl card-sm"
			>
				<div class="card-body gap-1 p-2">
					<a
						href="https://github.com/fnschmidt/campus-unbloat"
						target="_blank"
						aria-label="Quellcode (GitHub)"
						class="btn justify-start btn-ghost btn-sm"
					>
						<!-- <Github size={18} /> -->
						<FontAwesomeIcon icon={faGithub} />
						Quellcode</a
					>
					<a
						href="https://github.com/fnschmidt/campus-unbloat/issues/new?assignees=fnschmidt&labels=triage&title=[Feature]:%20/[Bug]:%20...&body=Describe%20a%20bug%20you%20encountered,%20or%20a%20feature%20that%20you%20think%20is%20missing."
						target="_blank"
						class="btn justify-start btn-ghost btn-sm"
						><FontAwesomeIcon icon={faBug} /> Fehler melden</a
					>
					<a
						href="https://v1.unbloat.app"
						target="_blank"
						class="btn justify-start btn-ghost btn-sm"
						><FontAwesomeIcon icon={faUpRightFromSquare} /> Zur alten Version</a
					>
				</div>
			</div>
		</div>

		{#if page.route.id != '/'}
			<div class="dropdown dropdown-end">
				<div
					tabindex="0"
					role="button"
					aria-label="Rechtliches"
					title="Rechtliches"
					class="btn btn-circle btn-ghost btn-sm"
				>
					<FontAwesomeIcon icon={faScaleBalanced} class="text-base opacity-70" />
				</div>
				<div
					tabindex="-1"
					class="dropdown-content card z-1 mt-2 w-44 rounded-box border border-base-300 bg-base-100 shadow-xl card-sm"
				>
					<div class="card-body gap-1 p-2">
						<a href={resolve('/impressum')} class="btn justify-start btn-ghost btn-sm">Impressum</a>
						<a href={resolve('/datenschutz')} class="btn justify-start btn-ghost btn-sm"
							>Datenschutz</a
						>
					</div>
				</div>
			</div>
		{/if}

		{#if page.route.id == '/impressum' || page.route.id == '/datenschutz'}
			<!-- full page load: the server redirects to the dashboard when logged in -->
			<a
				href={resolve('/')}
				data-sveltekit-reload
				class="btn rounded-full btn-soft btn-sm btn-primary"
			>
				Zurück
			</a>
		{/if}
		<SettingsModal />
		{#if page.route.id == '/dashboard'}
			<button
				class="btn btn-circle btn-ghost btn-sm text-accent"
				aria-label="Abmelden"
				title="Abmelden"
				onclick={async () => {
					await fetch('/logout', {
						method: 'POST'
					});
					goto(resolve('/'));
				}}
			>
				<!-- <LogOut size={16} strokeWidth={3} /> -->
				<FontAwesomeIcon icon={faRightFromBracket} />
			</button>
		{/if}
		{#if page.route.id == '/'}
			<a
				href="https://github.com/fnschmidt/campus-unbloat"
				target="_blank"
				aria-label="Quellcode (GitHub)"
				class="btn rounded-full btn-ghost btn-sm"><FontAwesomeIcon icon={faGithub} />Quellcode</a
			>
		{/if}
	</div>
</nav>
