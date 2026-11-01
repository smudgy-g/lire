<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { ToggleGroup } from 'bits-ui';
	import {
		initStore,
		cardsInCurrentLang,
		highlightAboveLevel,
		isDue,
		lang,
		ui
	} from '#lib/store.ts';
	import { LANGS, pickLang } from '#lib/lang.ts';

	let { children } = $props();

	onMount(initStore);

	const navLinks = $derived(
		(['/', '/read', '/stories', '/cards'] as const).map(
			(path, index) => [path, $ui.nav[index]] as const
		)
	);

	const isCurrentPage = (path: string) =>
		path === '/'
			? page.url.pathname === '/'
			: page.url.pathname.startsWith(path) ||
				(path === '/stories' && page.url.pathname.startsWith('/story'));

	const dueCount = $derived($cardsInCurrentLang.filter(isDue).length);
</script>

<header>
	<div class="bar">
		<a href={resolve('/')} class="mark">
			{$ui.brand}
			<span>{$ui.brandSubtitle}</span>
		</a>
		<nav>
			{#each navLinks as [path, label] (path)}
				<a href={resolve(path)} aria-current={isCurrentPage(path) ? 'page' : undefined}>
					{label}
					{#if path === '/cards' && dueCount}
						<span class="badge">{dueCount}</span>
					{/if}
				</a>
			{/each}
		</nav>
		<div class="lv">
			<ToggleGroup.Root
				type="single"
				class="toggles"
				value={$lang}
				onValueChange={(code) => code && lang.set(pickLang(code))}
				aria-label="Langue / Idioma"
			>
				{#each Object.entries(LANGS) as [code, language] (code)}
					<ToggleGroup.Item value={code}>{language.code}</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
			<span class="eyebrow" title={$ui.levelHint}>{$ui.level}</span>
			<ToggleGroup.Root
				type="single"
				class="toggles"
				value={String($highlightAboveLevel)}
				onValueChange={(level) => level && highlightAboveLevel.set(Number(level))}
				aria-label={$ui.level}
				title={$ui.levelHint}
			>
				{#each ['A2', 'B1', 'B2'] as levelLabel, index (levelLabel)}
					<ToggleGroup.Item value={String(index + 1)}>{levelLabel}</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
		</div>
	</div>
</header>

<main>{@render children()}</main>

<footer class="muted">
	{#each $ui.credits as [role, sourceName, href, license], index (index)}
		{index > 0 ? ' · ' : ''}
		{role} :
		<a {href} rel="external">{sourceName}</a>
		{license}
	{/each}
</footer>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 10;
		background: color-mix(in srgb, var(--bg) 85%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--line);
	}

	.bar {
		max-width: 760px;
		margin: 0 auto;
		padding: 14px 20px;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 24px;
	}

	.mark {
		font: 500 15px/1 var(--serif);
		letter-spacing: 0.22em;
		text-transform: uppercase;
		text-decoration: none;
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.mark span {
		font: italic 400 14px var(--serif);
		letter-spacing: 0;
		text-transform: none;
		color: var(--mute);
	}

	nav {
		display: flex;
		gap: 22px;
	}

	nav a {
		font: 500 13px/1 var(--sans);
		color: var(--mute);
		text-decoration: none;
		padding: 8px 0;
		border-bottom: 1.5px solid transparent;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	nav a:hover {
		color: var(--ink);
	}

	nav a[aria-current] {
		color: var(--ink);
		border-color: var(--acc);
	}

	.badge {
		font: 600 10px/1 var(--sans);
		background: var(--acc);
		color: var(--acc-ink);
		border-radius: 999px;
		padding: 3px 6px;
	}

	.lv {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.lv .eyebrow::after {
		display: none;
	}

	main {
		max-width: 760px;
		margin: 0 auto;
		padding: 32px 20px 96px;
	}

	footer {
		max-width: 760px;
		margin: 0 auto;
		padding: 0 20px 32px;
		font-size: 12px;
	}

	footer a {
		color: inherit;
	}

	@media (max-width: 680px) {
		.bar {
			grid-template-columns: 1fr auto;
			gap: 10px 12px;
			padding: 12px 16px 0;
		}
		.mark span,
		.lv .eyebrow {
			display: none;
		}
		nav {
			grid-column: 1 / -1;
			order: 3;
			justify-content: space-between;
		}
		nav a {
			padding: 10px 0 12px;
		}
		main {
			padding: 24px 16px 96px;
		}
	}
</style>
