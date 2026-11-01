import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';
import { annotateParagraphs, assertPublicUrl } from '#lib/server/nlp.ts';
import { pickLang } from '#lib/lang.ts';
import { readText } from '#lib/server/decode.ts';

const MAX_PARAGRAPHS = 300;
const MAX_PARAGRAPH_LENGTH = 2000;

async function fetchArticle(url: string, language: string) {
	let safeUrl;

	try {
		safeUrl = assertPublicUrl(url);
	} catch {
		throw error(400, 'Invalid or disallowed URL');
	}

	let html;

	try {
		const response = await fetch(safeUrl, {
			headers: {
				'user-agent': 'Mozilla/5.0 (compatible; lire-en-francais/0.1)',
				'accept-language': language
			},
			signal: AbortSignal.timeout(10000)
		});

		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		html = await readText(response);
	} catch {
		throw error(502, 'Could not fetch that page. Paste the text instead.');
	}

	const article = new Readability(parseHTML(html).document).parse();

	if (!article) throw error(422, 'Could not find article text. Paste the text instead.');

	const paragraphs = [...parseHTML(article.content).document.querySelectorAll('p,h1,h2,h3,li')]
		.map((element) => element.textContent.trim())
		.filter(Boolean);

	return { title: article.title || safeUrl, source: new URL(safeUrl).hostname, paragraphs };
}

const splitPastedText = (text: string) =>
	text
		.split(/\n+/)
		.map((line) => line.trim())
		.filter(Boolean);

export const POST: RequestHandler = async ({ request }) => {
	const { url, text, lang } = await request.json();
	const language = pickLang(lang);

	const { title, source, paragraphs } = url
		? await fetchArticle(url, language)
		: { title: 'Pasted text', source: '', paragraphs: text ? splitPastedText(String(text)) : [] };

	const limitedParagraphs = paragraphs
		.slice(0, MAX_PARAGRAPHS)
		.map((paragraph) => paragraph.slice(0, MAX_PARAGRAPH_LENGTH));

	if (!limitedParagraphs.length) throw error(422, 'No text found');

	return Response.json({
		title,
		source,
		paragraphs: annotateParagraphs(limitedParagraphs, language)
	});
};
