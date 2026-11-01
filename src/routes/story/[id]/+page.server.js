import stories from '$lib/stories.json';
import { tokenizeStory } from '$lib/tokenize.js';
import { tag } from '$lib/server/nlp.js';
export function load({ params }) {
  const story = stories.find((x) => x.id === params.id);
  return { story, paragraphs: story ? tokenizeStory(story.text).map(tag) : [] };
}
