<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Button } from 'bits-ui';
	import Reader from '#lib/Reader.svelte';
	import type { Token } from '#lib/tokenize.ts';
	import { lang, ui } from '#lib/store.ts';

	interface Article {
		title: string;
		source: string;
		paragraphs: Token[][];
	}

	let input = $state(''),
		article = $state<Article | null>(null),
		errorMessage = $state(''),
		loading = $state(false);

	const isUrl = (text: string) => /^https?:\/\/\S+$/.test(text);

	async function loadArticle() {
		const value = input.trim();

		if (!value) return;
		loading = true;
		errorMessage = '';
		article = null;

		try {
			const response = await fetch('/api/article', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					lang: $lang,
					...(isUrl(value) ? { url: value } : { text: value })
				})
			});

			if (response.ok) article = await response.json();
			else errorMessage = (await response.json().catch(() => ({}))).message || $ui.read.error;
		} catch {
			errorMessage = $ui.read.networkError;
		}

		loading = false;
	}

	onMount(() => {
		const urlFromQuery = page.url.searchParams.get('url');

		if (urlFromQuery) {
			input = urlFromQuery;
			loadArticle();
		}
	});
</script>

{#if !article}
	<section class="intro">
		<span class="eyebrow">{$ui.read.eyebrow}</span>
		<h1>
			{$ui.read.heading[0]}
			<br />
			<em>{$ui.read.heading[1]}</em>
		</h1>
		<p class="muted">{$ui.read.intro}</p>
	</section>
{/if}

<form
	class="paste"
	onsubmit={(event) => {
		event.preventDefault();
		loadArticle();
	}}
>
	<textarea
		rows={article ? 1 : 4}
		placeholder={$ui.read.placeholder}
		bind:value={input}
		onkeydown={(event) =>
			event.key === 'Enter' && (event.metaKey || event.ctrlKey) && loadArticle()}></textarea>
	<Button.Root type="submit" class="btn primary" disabled={loading || !input.trim()}>
		{loading ? $ui.read.loading : $ui.read.submit}
	</Button.Root>
</form>

{#if errorMessage}
	<p class="err">{errorMessage}</p>
{/if}

{#if loading}
	<div class="card">
		<div class="skeleton" style="height:28px;width:70%"></div>
		{#each [0, 1, 2, 3] as placeholder (placeholder)}
			<div class="skeleton" style="height:16px;margin-top:14px"></div>
		{/each}
	</div>
{/if}

{#if article}
	<header class="doc">
		{#if article.source}
			<span class="eyebrow">{article.source}</span>
		{/if}
		<h1>{article.title}</h1>
		<ul class="legend muted">
			<li>
				<span class="u hard">{$ui.read.hardLabel}</span>
				{$ui.read.hardHint}
			</li>
			<li>
				<span class="u saved">{$ui.read.savedLabel}</span>
				{$ui.read.savedHint}
			</li>
			<li>{$ui.read.tapHint}</li>
		</ul>
	</header>
	<Reader paragraphs={article.paragraphs} />
{/if}

<style>
	.intro {
		display: grid;
		gap: 14px;
		margin-bottom: 28px;
	}

	.intro em {
		color: var(--sage);
	}

	.intro p {
		margin: 0;
		font-size: 16px;
	}

	.paste {
		display: grid;
		gap: 12px;
		justify-items: end;
		margin-bottom: 28px;
	}

	.err {
		color: var(--acc);
		font-size: 14px;
	}

	.doc {
		display: grid;
		gap: 14px;
		margin: 12px 0 28px;
		padding-bottom: 24px;
		border-bottom: 1px solid var(--line);
	}

	.doc h1 {
		font-size: clamp(1.9rem, 5.5vw, 2.6rem);
	}

	.legend {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 6px 18px;
		font-size: 13px;
	}

	.legend .u {
		cursor: default;
	}
</style>
