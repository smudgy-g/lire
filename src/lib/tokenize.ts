export interface Token {
	text: string;
	isWord?: boolean;
	gloss?: string;
	isKeyWord?: boolean;
	lemma?: string;
	level?: number | null;
	isPhrase?: boolean;
}

export interface Lexicon {
	formToLemma: Record<string, string>;
	lemmaLevels: Record<string, number>;
	phrases: Record<string, [phrase: string, level: number]>;
	displaySpellings: Record<string, string>;
}

export const normalizeApostrophes = (text: string) => text.replace(/'/g, '’');

const WORD_PATTERN = /(\p{L}+’)|(\p{L}[\p{L}-]*)/gu;

export function tokenizePlain(rawText: string): Token[] {
	const text = normalizeApostrophes(rawText);
	const tokens: Token[] = [];
	let position = 0;

	for (const match of text.matchAll(WORD_PATTERN)) {
		if (match.index > position) tokens.push({ text: text.slice(position, match.index) });
		tokens.push({ text: match[0], isWord: true });
		position = match.index + match[0].length;
	}

	if (position < text.length) tokens.push({ text: text.slice(position) });

	return tokens;
}

export const lookupKey = (word: string) =>
	normalizeApostrophes(word).toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae');

const ELIDED_ENDING = /’$/;
const INVERTED_PRONOUN = /(-t)?-(je|tu|il|elle|on|nous|vous|ils|elles|moi|toi)$/;

export const lemmaOf = (lexicon: Lexicon, word: string): string | null => {
	const key = lookupKey(word).replace(ELIDED_ENDING, 'e').replace(INVERTED_PRONOUN, '');

	return lexicon.formToLemma[key] ?? (key in lexicon.lemmaLevels ? key : null);
};

export const phraseKey = (text: string, toLemma: (word: string) => string) =>
	tokenizePlain(text)
		.filter((token) => token.isWord)
		.map((token) => toLemma(token.text))
		.join(' ');

const KEY_WORD_MARKUP = /\[([^=\]]+)=([^\]]+)\]/;

export const stripKeyWordMarkup = (text: string) =>
	text.replace(new RegExp(KEY_WORD_MARKUP, 'g'), (_, word) => word);

export const tokenizeStory = (storyText: string): Token[][] =>
	storyText.split('\n\n').map((paragraph) => {
		const [plainText, ...markedParts] = paragraph.split(KEY_WORD_MARKUP);
		const tokens = tokenizePlain(plainText);

		for (let index = 0; index < markedParts.length; index += 3) {
			const [word, gloss, followingText] = markedParts.slice(index, index + 3);

			tokens.push({ text: word, isWord: true, gloss, isKeyWord: true });
			tokens.push(...tokenizePlain(followingText));
		}

		return tokens;
	});
