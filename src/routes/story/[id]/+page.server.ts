import type { EntryGenerator, PageServerLoad } from './$types';
import stories from '#lib/stories.json';
import { tokenizeStory } from '#lib/tokenize.ts';
import { tagTokens } from '#lib/server/nlp.ts';

export const entries: EntryGenerator = () => stories.map((story) => ({ id: story.id }));

export const load: PageServerLoad = ({ params }) => {
	const story = stories.find((candidate) => candidate.id === params.id);

	return {
		story,
		paragraphs: story
			? tokenizeStory(story.text).map((paragraph) => tagTokens(paragraph, story.lang))
			: []
	};
};
