<script lang="ts">
	import stories from '#lib/stories.json';
	import { lang, ui } from '#lib/store.ts';
	import { stripKeyWordMarkup } from '#lib/tokenize.ts';
	import { resolve } from '$app/paths';

	const storiesInCurrentLang = $derived(stories.filter((story) => (story.lang ?? 'fr') === $lang));
</script>

<section class="intro">
	<span class="eyebrow">{$ui.stories.eyebrow}</span>
	<h1>
		{$ui.stories.heading[0]}
		<br />
		<em>{$ui.stories.heading[1]}</em>
	</h1>
	<p class="muted">{$ui.stories.intro}</p>
</section>

<div class="grid">
	{#each storiesInCurrentLang as story, index (story.id)}
		<a class="card" href={resolve('/story/[id]', { id: story.id })}>
			<span class="eyebrow">{String(index + 1).padStart(2, '0')} · {story.level}</span>
			<h3>{story.title}</h3>
			<p>{stripKeyWordMarkup(story.text).slice(0, 120)}…</p>
		</a>
	{/each}
</div>

<style>
	.intro {
		display: grid;
		gap: 14px;
		margin-bottom: 32px;
	}

	.intro em {
		color: var(--sage);
	}

	.intro p {
		margin: 0;
		font-size: 16px;
	}

	.grid {
		display: grid;
		gap: 14px;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}

	h3 {
		font-size: 24px;
		margin: 14px 0 8px;
	}

	.card p {
		margin: 0;
		color: var(--mute);
		font: 16px/1.55 var(--serif);
	}
</style>
