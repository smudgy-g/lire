<script lang="ts">
	import { Button } from 'bits-ui';
	import { cards, cardsInCurrentLang, isDue, speak, toCard, ui, type Card } from '#lib/store.ts';

	const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
	const MAX_REVIEW_BOX = REVIEW_INTERVAL_DAYS.length - 1;
	const DAY_MS = 24 * 60 * 60 * 1000;
	const RETRY_DELAY_MS = 60 * 1000;

	let showingBack = $state(false);
	const dueCards = $derived($cardsInCurrentLang.filter(isDue));
	const currentCard = $derived(dueCards[0]);

	function reviewCard(card: Card, remembered: boolean): Card {
		const reviewBox = remembered ? Math.min(card.reviewBox + 1, MAX_REVIEW_BOX) : 0;
		const delay = REVIEW_INTERVAL_DAYS[reviewBox] * DAY_MS + (remembered ? 0 : RETRY_DELAY_MS);

		return { ...card, reviewBox, dueAt: Date.now() + delay };
	}

	function grade(remembered: boolean) {
		const reviewed = currentCard;

		cards.update((allCards) =>
			allCards.map((card) => (card === reviewed ? reviewCard(card, remembered) : card))
		);

		showingBack = false;
	}

	function flipCard() {
		showingBack = !showingBack;
		if (showingBack) speak(currentCard.word, false, currentCard.lang);
	}

	function exportProgress() {
		const link = document.createElement('a');

		link.href = URL.createObjectURL(
			new Blob([JSON.stringify({ cards: $cards }, null, 1)], { type: 'application/json' })
		);

		link.download = 'lire-progress.json';
		link.click();
	}

	async function importProgress(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];

		if (!file) return;

		try {
			const progress = JSON.parse(await file.text());

			cards.set((progress.cards || []).map(toCard));
		} catch {
			alert($ui.cards.invalidFile);
		}
	}
</script>

<section class="intro">
	<span class="eyebrow">{$ui.cards.eyebrow}</span>
	<h1>
		{$ui.cards.heading[0]}
		<br />
		<em>{$ui.cards.heading[1]}</em>
	</h1>
	<p class="muted">{$ui.cards.summary($cardsInCurrentLang.length, dueCards.length)}</p>
</section>

{#if !$cardsInCurrentLang.length}
	<div class="card empty">
		<h3>{$ui.cards.emptyTitle}</h3>
		<p class="muted">{$ui.cards.emptyBody}</p>
		<Button.Root href="/stories" class="btn primary">{$ui.cards.readStory}</Button.Root>
	</div>
{:else if !currentCard}
	<div class="card empty">
		<h3>{$ui.cards.allDoneTitle}</h3>
		<p class="muted">{$ui.cards.allDoneBody($cardsInCurrentLang.length)}</p>
	</div>
{:else}
	<button
		class="flash"
		class:flip={showingBack}
		onclick={flipCard}
		aria-label={showingBack ? $ui.cards.showWord : $ui.cards.showMeaning}
	>
		<span class="face front">
			<span class="eyebrow">{$ui.cards.frontLabel}</span>
			<span class="word">{currentCard.word}</span>
			<span class="muted">{$ui.cards.flipHint}</span>
		</span>
		<span class="face back">
			<span class="eyebrow">{$ui.cards.backLabel}</span>
			<span class="word">{currentCard.translation}</span>
			<span class="muted">{currentCard.word}</span>
		</span>
	</button>
	<div class="grade">
		<Button.Root class="btn" onclick={() => grade(false)}>{$ui.cards.again}</Button.Root>
		<Button.Root class="btn forest" onclick={() => grade(true)}>{$ui.cards.know}</Button.Root>
	</div>
{/if}

<div class="io">
	<Button.Root class="btn ghost" onclick={exportProgress}>{$ui.cards.export}</Button.Root>
	<label class="btn ghost">
		{$ui.cards.import}
		<input type="file" accept=".json" hidden onchange={importProgress} />
	</label>
</div>

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
	}

	.empty {
		display: grid;
		gap: 10px;
		justify-items: start;
	}

	.empty h3 {
		font-size: 22px;
	}

	.empty p {
		margin: 0 0 6px;
	}

	.flash {
		display: grid;
		width: 100%;
		min-height: 260px;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		cursor: pointer;
		perspective: 1200px;
		font: inherit;
	}

	.face {
		grid-area: 1 / 1;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 14px;
		padding: 32px;
		border-radius: 24px;
		border: 1px solid var(--line);
		background: var(--paper);
		box-shadow: var(--shadow);
		backface-visibility: hidden;
		transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
	}

	.face .eyebrow::after {
		display: none;
	}

	.back {
		transform: rotateY(180deg);
		background: var(--forest);
		color: var(--bg);
		border-color: var(--forest);
	}
	.back .eyebrow,
	.back .muted {
		color: color-mix(in srgb, var(--bg) 70%, transparent);
	}

	.flip .front {
		transform: rotateY(-180deg);
	}

	.flip .back {
		transform: rotateY(0);
	}

	.word {
		font: 400 clamp(2rem, 8vw, 2.8rem)/1.15 var(--serif);
		text-align: center;
	}

	.grade {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-top: 16px;
	}

	.grade :global(.btn) {
		padding: 16px;
	}

	.io {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-top: 32px;
	}
</style>
