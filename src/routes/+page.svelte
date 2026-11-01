<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { ToggleGroup } from 'bits-ui';
	import { lang, ui } from '#lib/store.ts';

	interface FeedItem {
		title: string;
		link: string;
		source: string;
		date: string;
		summary: string;
	}

	let items = $state<FeedItem[]>([]),
		selectedTopic = $state('news'),
		loading = $state(true),
		failedCount = $state(0);

	async function loadFeed(language = $lang) {
		loading = true;
		// not every language has every topic (Spanish has no software)
		if (!Object.hasOwn($ui.feed.topics, selectedTopic)) selectedTopic = 'news';

		try {
			const query = new URLSearchParams({ lang: language, topics: selectedTopic });
			const response = await (await fetch(`/api/feed?${query}`)).json();

			items = response.items;
			failedCount = response.failedCount;
		} catch {
			items = [];
		}

		loading = false;
	}

	onMount(() => {
		try {
			selectedTopic = localStorage.getItem('topic') || selectedTopic;
		} catch {
			return;
		}
	});

	$effect(() => {
		loadFeed($lang);
	});

	function selectTopic(topic: string) {
		// clicking the active topic deselects it; keep one selected
		if (!topic) return;
		selectedTopic = topic;
		localStorage.setItem('topic', topic);
		loadFeed();
	}

	const formatDay = (date: string) =>
		date ? new Date(date).toLocaleDateString($ui.voice, { day: 'numeric', month: 'short' }) : '';
</script>

<section class="hero">
	<span class="eyebrow">{$ui.feed.eyebrow}</span>
	<h1>
		{$ui.feed.heading[0]}
		<br />
		<em>{$ui.feed.heading[1]}</em>
	</h1>
	<p class="muted">{$ui.feed.intro}</p>
	<ToggleGroup.Root
		type="single"
		class="toggles"
		bind:value={() => selectedTopic, selectTopic}
		aria-label={$ui.feed.eyebrow}
	>
		{#each Object.entries($ui.feed.topics) as [topic, label] (topic)}
			<ToggleGroup.Item value={topic}>{label}</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
</section>

<div class="list" aria-busy={loading}>
	{#if loading}
		{#each [0, 1, 2] as placeholder (placeholder)}
			<div class="card">
				<div class="skeleton" style="height:10px;width:30%"></div>
				<div class="skeleton" style="height:22px;width:85%;margin:14px 0 10px"></div>
				<div class="skeleton" style="height:14px;width:95%"></div>
			</div>
		{/each}
	{:else}
		{#each items as item, index (index)}
			<a class="card item" href={resolve(`/read?url=${encodeURIComponent(item.link)}`)}>
				<span class="eyebrow">
					{item.source}
					{#if item.date}
						· {formatDay(item.date)}
					{/if}
				</span>
				<h3>{item.title}</h3>
				{#if item.summary}
					<p>{item.summary}</p>
				{/if}
				<span class="go">{$ui.feed.readArticle}</span>
			</a>
		{:else}
			<div class="card empty">
				<h3>{$ui.feed.emptyTitle}</h3>
				<p class="muted">
					{$ui.feed.emptyBody} <a href={resolve('/read')}>{$ui.nav[1]}</a>.
				</p>
			</div>
		{/each}
		{#if failedCount}
			<p class="muted">{failedCount} {$ui.feed.sourcesFailed}</p>
		{/if}
	{/if}
</div>

<style>
	/* five topics don't fit one row on a phone */
	.hero :global(.toggles) {
		flex-wrap: wrap;
		border-radius: 22px;
	}
	.hero {
		display: grid;
		gap: 14px;
		justify-items: start;
		margin-bottom: 32px;
	}

	.hero em {
		color: var(--sage);
	}

	.hero p {
		margin: 0 0 6px;
		font-size: 16px;
	}

	.list {
		display: grid;
		gap: 14px;
	}

	.item h3 {
		font-size: 23px;
		line-height: 1.25;
		margin: 12px 0 8px;
	}

	.item p {
		margin: 0;
		color: var(--mute);
		font-size: 15px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.go {
		display: inline-block;
		margin-top: 14px;
		font: 500 13px var(--sans);
		color: var(--acc);
	}

	.empty h3 {
		font-size: 22px;
		margin-bottom: 6px;
	}
</style>
