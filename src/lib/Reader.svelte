<script lang="ts">
	import { Popover } from 'bits-ui';
	import type { Token } from '#lib/tokenize.ts';
	import { cards, cardsInCurrentLang, highlightAboveLevel, lang, ui, speak } from '#lib/store.ts';

	let { paragraphs = [] }: { paragraphs?: Token[][] } = $props();

	let selectedToken = $state.raw<Token | null>(null),
		gloss = $state<string | null>(null),
		popoverAnchor = $state<HTMLElement | null>(null),
		popoverOpen = $state(false);

	const savedWords = $derived(new Set($cardsInCurrentLang.map((card) => card.word)));

	const cardWordFor = (token: Token) => (token.gloss ? token.text : (token.lemma ?? token.text));

	const isPlaceholderGloss = (text: string) => text.startsWith('(');

	const LEVEL_LABELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

	async function selectToken(event: MouseEvent & { currentTarget: HTMLElement }, token: Token) {
		selectedToken = token;
		popoverAnchor = event.currentTarget;
		popoverOpen = true;
		gloss = token.gloss || null;
		speak(token.text);

		if (gloss) return;

		try {
			const query = new URLSearchParams({
				lang: $lang,
				word: cardWordFor(token),
				form: token.text
			});

			const response = await (await fetch(`/api/define?${query}`)).json();

			if (selectedToken === token) gloss = response.gloss || $ui.popover.noDefinition;
		} catch {
			if (selectedToken === token) gloss = $ui.popover.offline;
		}
	}

	function saveSelectedWord() {
		const word = selectedToken && cardWordFor(selectedToken);
		const translation = gloss;

		if (!word || !translation || isPlaceholderGloss(translation) || savedWords.has(word)) return;

		cards.update((allCards) => [
			...allCards,
			{ word, translation, lang: $lang, reviewBox: 0, dueAt: 0 }
		]);
	}
</script>

<article class="read">
	{#each paragraphs as paragraph, paragraphIndex (paragraphIndex)}
		<p>
			{#each paragraph as token, tokenIndex (tokenIndex)}
				{#if token.isWord}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<span
						class="u"
						class:k={token.isKeyWord}
						class:hard={token.level != null && token.level > $highlightAboveLevel}
						class:saved={savedWords.has(cardWordFor(token))}
						class:sel={popoverOpen && selectedToken === token}
						onclick={(event) => selectToken(event, token)}
					>
						{token.text}
					</span>
				{:else}
					{token.text}
				{/if}
			{/each}
		</p>
	{/each}
</article>

<Popover.Root bind:open={popoverOpen}>
	<Popover.Portal>
		<Popover.Content
			class="pop"
			customAnchor={popoverAnchor}
			side="bottom"
			sideOffset={8}
			collisionPadding={16}
			trapFocus={false}
			onOpenAutoFocus={(event) => event.preventDefault()}
		>
			{#if selectedToken}
				{@const cardWord = cardWordFor(selectedToken)}
				{@const showLemma =
					cardWord !== selectedToken.text && cardWord !== selectedToken.text.toLowerCase()}
				<div class="pop-head">
					<span class="pop-word">{selectedToken.text}</span>
					{#if showLemma}
						<span class="pop-lemma">→ {cardWord}</span>
					{/if}
					{#if selectedToken.level != null}
						<span class="pop-lv">{LEVEL_LABELS[selectedToken.level]}</span>
					{/if}
				</div>
				<p class="pop-gloss" class:wait={!gloss}>{gloss ?? $ui.popover.loading}</p>
				<div class="pop-actions">
					{#if savedWords.has(cardWord)}
						<button class="btn" disabled>{$ui.popover.saved}</button>
					{:else}
						<button
							class="btn primary"
							onclick={saveSelectedWord}
							disabled={!gloss || isPlaceholderGloss(gloss)}
						>
							{$ui.popover.save}
						</button>
					{/if}
					<button
						class="btn ghost"
						onclick={() => selectedToken && speak(selectedToken.text, true)}
						aria-label={$ui.popover.listenSlowlyLabel}
					>
						{$ui.popover.listen}
					</button>
				</div>
			{/if}
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>

<style>
	.read {
		font: 19px/1.8 var(--serif);
		max-width: 64ch;
	}

	.read p {
		margin: 0 0 1.2em;
	}
</style>
