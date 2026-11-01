import type { RequestHandler } from './$types';
import frenchGlossary from '#lib/server/lexicon.json';
import { pickLang } from '#lib/lang.ts';

const FRENCH_GLOSSARY: Record<string, string> = frenchGlossary;

const CACHE_HEADERS = {
	'cache-control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400'
};

const lookupFrenchGlossary = (word: string | null) =>
	(word && FRENCH_GLOSSARY[word.toLowerCase()]) || null;

const toWiktionaryTitle = (word: string) => word.toLowerCase().replace(/’$/, '').replace(/’/g, "'");

const stripHtmlTags = (html: string) => html.replace(/<[^>]+>/g, '');

async function fetchWiktionaryDefinition(word: string, language: string) {
	const response = await fetch(
		'https://en.wiktionary.org/api/rest_v1/page/definition/' +
			encodeURIComponent(toWiktionaryTitle(word)),
		{
			headers: { 'user-agent': 'lire-en-francais/0.1 (personal learning app)' },
			signal: AbortSignal.timeout(6000)
		}
	);

	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	const definitionsByLanguage = await response.json();

	const firstDefinition: string | undefined =
		definitionsByLanguage?.[language]?.[0]?.definitions?.[0]?.definition;

	return firstDefinition ? stripHtmlTags(firstDefinition).slice(0, 120) : null;
}

export const GET: RequestHandler = async ({ url }) => {
	const word = (url.searchParams.get('word') || '').trim();
	const tappedForm = url.searchParams.get('form');
	const language = pickLang(url.searchParams.get('lang'));

	if (!word) return Response.json({ gloss: null });

	const glossaryEntry =
		language === 'fr' && (lookupFrenchGlossary(tappedForm) || lookupFrenchGlossary(word));

	if (glossaryEntry) return Response.json({ gloss: glossaryEntry }, { headers: CACHE_HEADERS });

	try {
		const gloss = await fetchWiktionaryDefinition(word, language);

		return Response.json({ gloss }, { headers: CACHE_HEADERS });
	} catch {
		return Response.json({ gloss: null });
	}
};
