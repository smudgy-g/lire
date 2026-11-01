import frenchLexicon from './lex.json';
import spanishLexicon from './lex-es.json';
import { tokenizePlain, lookupKey, lemmaOf, type Lexicon, type Token } from '../tokenize.ts';
import { pickLang, type Lang } from '../lang.ts';

const LEXICONS = { fr: frenchLexicon, es: spanishLexicon } as unknown as Record<Lang, Lexicon>;

const MAX_PHRASE_WORDS = 6;

const isWhitespace = (token: Token) => /^\s+$/.test(token.text);

export function tagTokens(tokens: Token[], language?: string): Token[] {
	const lexicon = LEXICONS[pickLang(language)];
	const toLemma = (word: string) => lemmaOf(lexicon, word);

	function findLongestPhrase(startIndex: number) {
		const lemmas: string[] = [];
		let longest: { endIndex: number; phrase: string; level: number } | null = null;

		for (
			let index = startIndex;
			index < tokens.length && lemmas.length < MAX_PHRASE_WORDS;
			index++
		) {
			const token = tokens[index];

			if (!token.isWord) {
				if (isWhitespace(token)) continue;

				break;
			}

			if (token.isKeyWord) break;
			lemmas.push(toLemma(token.text) ?? lookupKey(token.text));
			const match = lemmas.length > 1 ? lexicon.phrases[lemmas.join(' ')] : undefined;

			if (match) longest = { endIndex: index, phrase: match[0], level: match[1] };
		}

		return longest;
	}

	const tagged: Token[] = [];

	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index];

		if (!token.isWord) {
			tagged.push(token);

			continue;
		}

		const lemma = toLemma(token.text);

		if (token.isKeyWord) {
			tagged.push({ ...token, level: lemma ? lexicon.lemmaLevels[lemma] : null });

			continue;
		}

		const phrase = findLongestPhrase(index);

		if (phrase) {
			tagged.push({
				text: tokens
					.slice(index, phrase.endIndex + 1)
					.map((part) => part.text)
					.join(''),
				isWord: true,
				isPhrase: true,
				lemma: phrase.phrase,
				level: phrase.level
			});

			index = phrase.endIndex;
		} else if (lemma) {
			tagged.push({
				...token,
				lemma: lexicon.displaySpellings[lemma] ?? lemma,
				level: lexicon.lemmaLevels[lemma]
			});
		} else {
			tagged.push({ ...token, level: null });
		}
	}

	return tagged;
}

export const annotateParagraphs = (paragraphs: string[], language: string) =>
	paragraphs.map((paragraph) => tagTokens(tokenizePlain(paragraph), language));

const PRIVATE_IPV4 = /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/;

export function assertPublicUrl(rawUrl: string) {
	const url = new URL(rawUrl);
	const host = url.hostname;

	const isDisallowed =
		!/^https?:$/.test(url.protocol) ||
		host === 'localhost' ||
		host.includes(':') ||
		host.endsWith('.local') ||
		PRIVATE_IPV4.test(host);

	if (isDisallowed) throw new Error('URL not allowed');

	return url.href;
}
