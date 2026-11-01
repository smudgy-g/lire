import { json } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { FEEDS } from '$lib/feeds.js';
const xp = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@' });
const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const txt = (x) => (typeof x === 'object' && x ? x['#text'] ?? '' : String(x ?? ''));
const clean = (s) => txt(s).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
async function load(f, topic) {
  const r = await fetch(f.url, { headers: { 'user-agent': 'lire-en-francais/0.1' }, signal: AbortSignal.timeout(8000) });
  const d = xp.parse(await r.text());
  const items = d.rss ? arr(d.rss.channel?.item) : arr(d.feed?.entry);
  return items.map((i) => {
    const link = d.rss ? txt(i.link) : (arr(i.link).find((l) => l['@rel'] !== 'enclosure') || {})['@href'];
    const date = txt(i.pubDate || i.published || i.updated);
    return { title: clean(i.title), link, source: f.name, topic, date, ts: Date.parse(date) || 0, summary: clean(i.description || i.summary || i.content).slice(0, 220) };
  }).filter((i) => i.title && i.link);
}
export async function GET({ url }) {
  const topics = (url.searchParams.get('topics') || 'news,software').split(',').filter((t) => FEEDS[t]);
  const res = await Promise.allSettled(topics.flatMap((t) => FEEDS[t].map((f) => load(f, t))));
  const items = res.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value.slice(0, 15)).sort((a, b) => b.ts - a.ts).slice(0, 40);
  return json({ items, failed: res.filter((r) => r.status === 'rejected').length }, { headers: { 'cache-control': 'public, s-maxage=900' } });
}
