<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	import type { ActionData } from './$types';

	// Svelte 5 (runes): `form` is derived from the server response, but can be temporarily overridden
	let { form: serverForm = null } = $props<{ form?: ActionData | null }>();

	let form = $derived(serverForm);
	let loginInProgress = $state(false);
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-6 p-4">
	<div class="flex flex-col items-center gap-3 text-center">
		<img
			src="/android-chrome-192x192.png"
			alt=""
			class="size-20 rounded-3xl shadow-lg ring-1 ring-base-300"
			width="80"
			height="80"
		/>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Willkommen zurück</h1>
			<p class="mt-1 opacity-60">Stundenplan, Noten und Mensa an einem Ort.</p>
		</div>
	</div>
	<div class="card w-full max-w-md border border-base-300/70 bg-base-100 shadow-sm">
		<div class="card-body gap-4">
			{#if form?.message}
				<div role="alert" class="alert alert-error">
					<span>{form.message}</span>
				</div>
			{/if}

			<form
				action="?/login"
				method="POST"
				class="space-y-4"
				use:enhance={() => {
					// Clear the previous response (e.g. bad credentials) and show a loading state.
					form = null;
					loginInProgress = true;

					return async ({ update }) => {
						await update();
						loginInProgress = false;
					};
				}}
			>
				<div class="flex flex-col gap-1.5">
					<label class="text-sm font-medium" for="username">CampusDual-Benutzername</label>
					<input
						id="username"
						name="username"
						type="text"
						autocomplete="username"
						required
						placeholder="500xxxx"
						class="input w-full bg-base-200 focus:bg-base-100"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label class="text-sm font-medium" for="password">CampusDual-Passwort</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						class="input w-full bg-base-200 focus:bg-base-100"
					/>
				</div>

				<div class="space-y-2 rounded-xl bg-base-200 p-3">
					<label class="label w-full cursor-pointer items-start justify-start gap-3">
						<input
							type="checkbox"
							name="dataConsent"
							required
							class="checkbox mt-1 shrink-0 checkbox-primary"
						/>
						<span class="label-text flex-1 leading-snug whitespace-normal">
							Ich stimme zu, dass sich
							<span
								class="bg-linear-to-br from-primary to-accent box-decoration-clone bg-clip-text text-transparent"
								>Campus-Am-Arsch</span
							>
							in meinem Namen bei CampusDual einloggt.
							<span class="block text-xs opacity-70">Daten werden nur lokal gespeichert.</span>
						</span>
					</label>

					<div class="mt-2 flex justify-end space-x-2">
						<a class="btn btn-ghost btn-xs" href={resolve('/impressum')}>Impressum</a>
						<a class="btn btn-ghost btn-xs" href={resolve('/datenschutz')}>Datenschutz</a>
					</div>
				</div>

				<div class="pt-2">
					<button
						type="submit"
						class="btn w-full btn-lg btn-primary"
						disabled={loginInProgress}
						aria-busy={loginInProgress}
					>
						{#if loginInProgress}
							<span class="loading loading-sm loading-spinner"></span>
						{/if}
						Anmelden
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
