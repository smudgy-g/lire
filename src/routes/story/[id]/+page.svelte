<script lang="ts">
	import { Button, RadioGroup } from 'bits-ui';
	import Reader from '#lib/Reader.svelte';
	import { speak, ui } from '#lib/store.ts';
	import { pickLang } from '#lib/lang.ts';
	import { stripKeyWordMarkup } from '#lib/tokenize.ts';
	import { resolve } from '$app/paths';

	let { data } = $props();
	const story = $derived(data.story);

	const CORRECT_OPTION_ID = '0';

	const shuffledOptions = $derived(
		story
			? story.quiz.options
					.map((text, index) => ({ text, id: String(index) }))
					.sort(() => Math.random() - 0.5)
			: []
	);

	let pickedOptionId = $state('');

	$effect.pre(() => {
		if (story) pickedOptionId = '';
	});

	const answered = $derived(pickedOptionId !== '');
	const answeredCorrectly = $derived(pickedOptionId === CORRECT_OPTION_ID);

	function optionClass(optionId: string) {
		if (optionId !== pickedOptionId) return '';

		return optionId === CORRECT_OPTION_ID ? 'right' : 'wrong';
	}
</script>

<a class="back muted" href={resolve('/stories')}>{$ui.stories.back}</a>

{#if story}
	<header>
		<span class="eyebrow">{$ui.stories.level} {story.level}</span>
		<h1>{story.title}</h1>
		<Button.Root
			class="btn forest"
			onclick={() => speak(stripKeyWordMarkup(story.text), false, pickLang(story.lang))}
		>
			{$ui.stories.listenToStory}
		</Button.Root>
	</header>
	<Reader paragraphs={data.paragraphs} />
	<section class="card quiz">
		<span class="eyebrow">{$ui.stories.quizTitle}</span>
		<h3>{story.quiz.question}</h3>
		<RadioGroup.Root class="choices" bind:value={pickedOptionId} aria-label={story.quiz.question}>
			{#each shuffledOptions as option (option.id)}
				<RadioGroup.Item value={option.id} class={optionClass(option.id)}>
					{option.text}
				</RadioGroup.Item>
			{/each}
		</RadioGroup.Root>
		<p class="fb" class:no={answered && !answeredCorrectly} aria-live="polite">
			{answered ? (answeredCorrectly ? $ui.stories.correct : $ui.stories.incorrect) : ''}
		</p>
	</section>
{:else}
	<h1>{$ui.stories.notFound}</h1>
{/if}

<style>
	.back {
		text-decoration: none;
		display: inline-block;
		margin-bottom: 20px;
	}

	.back:hover {
		color: var(--ink);
	}

	header {
		display: grid;
		gap: 14px;
		justify-items: start;
		margin-bottom: 28px;
		padding-bottom: 24px;
		border-bottom: 1px solid var(--line);
	}

	.quiz {
		margin-top: 32px;
	}

	.quiz h3 {
		font-size: 22px;
		margin-top: 12px;
	}

	.fb {
		min-height: 1.5em;
		margin: 12px 0 0;
		font-size: 14px;
		color: var(--sage);
	}

	.fb.no {
		color: var(--acc);
	}
</style>
