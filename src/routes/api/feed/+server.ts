import type { RequestHandler } from './$types';
import { XMLParser } from 'fast-xml-parser';
import { parseHTML } from 'linkedom';
import { FEEDS } from '#lib/feeds.ts';
import { pickLang } from '#lib/lang.ts';
import { readText } from '#lib/server/decode.ts';

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@' });

const ITEMS_PER_FEED = 15;
const MAX_ITEMS = 40;
const SUMMARY_LENGTH = 220;
// Video pages have no article text, only the player's consent notice
// (France 24 files them under /vidéo/ and /émissions/, Le Monde under /video/, El Viajero as /video-… slugs)
const VIDEO_PATH = /\/(vid[eé]os?|[eé]missions)[/-]/i;

const decodedPath = (link: string) => {
	try {
		return decodeURI(link);
	} catch {
		return link;
	}
};

const toArray = <T>(value: T | T[] | null | undefined): T[] =>
	value == null ? [] : Array.isArray(value) ? value : [value];

const textOf = (node: unknown): string =>
	typeof node === 'object' && node
		? String((node as { '#text'?: unknown })['#text'] ?? '')
		: String(node ?? '');

const toPlainText = (node: unknown) =>
	textOf(node)
		.replace(/<[^>]+>/g, ' ')
		// Decode entities (&eacute;) rather than drop them; feeds that escape their HTML twice leave tags behind, hence the second strip
		.replace(
			/&[a-z#0-9]+;/gi,
			(entity) => parseHTML(`<p>${entity}</p>`).document.querySelector('p')?.textContent ?? ' '
		)
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

async function loadFeed(feed: { name: string; url: string; include?: RegExp }, topic: string) {
	const response = await fetch(feed.url, {
		headers: { 'user-agent': 'lire-en-francais/0.1' },
		signal: AbortSignal.timeout(8000)
	});

	const parsed = xmlParser.parse(await readText(response));
	// RSS 2.0, RSS 1.0 (RDF) and Atom
	const isRss = Boolean(parsed.rss || parsed['rdf:RDF']);

	const entries = parsed.rss
		? toArray(parsed.rss.channel?.item)
		: parsed['rdf:RDF']
			? toArray(parsed['rdf:RDF'].item)
			: toArray(parsed.feed?.entry);

	return entries
		.map((entry) => {
			const link = isRss
				? textOf(entry.link)
				: (toArray(entry.link).find((link) => link['@rel'] !== 'enclosure') || {})['@href'];

			const date = textOf(entry.pubDate || entry['dc:date'] || entry.published || entry.updated);

			return {
				title: toPlainText(entry.title),
				link,
				source: feed.name,
				topic,
				date,
				timestamp: Date.parse(date) || 0,
				summary: toPlainText(entry.description || entry.summary || entry.content).slice(
					0,
					SUMMARY_LENGTH
				)
			};
		})
		.filter(
			(item) =>
				item.title &&
				item.link &&
				!VIDEO_PATH.test(decodedPath(item.link)) &&
				(!feed.include || feed.include.test(item.link))
		);
}

export const GET: RequestHandler = async ({ url }) => {
	const feedsByTopic = FEEDS[pickLang(url.searchParams.get('lang'))];

	const topics = (url.searchParams.get('topics') || 'news,software')
		.split(',')
		.filter((topic): topic is keyof typeof feedsByTopic => Object.hasOwn(feedsByTopic, topic));

	const results = await Promise.allSettled(
		topics.flatMap((topic) => feedsByTopic[topic].map((feed) => loadFeed(feed, topic)))
	);

	// Every feed gets an equal share, so busy sources (Le Monde) don't push slow ones (travel) off the list
	const perFeed = Math.min(ITEMS_PER_FEED, Math.ceil(MAX_ITEMS / results.length));

	const items = results
		.filter((result) => result.status === 'fulfilled')
		.flatMap((result) => result.value.slice(0, perFeed))
		.sort((a, b) => b.timestamp - a.timestamp);

	const failedCount = results.filter((result) => result.status === 'rejected').length;

	return Response.json(
		{ items, failedCount },
		{ headers: { 'cache-control': 'public, s-maxage=900' } }
	);
};
