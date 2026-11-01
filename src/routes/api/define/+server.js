import { json } from '@sveltejs/kit';
import lexicon from '$lib/server/lexicon.json'; // not nlp.js: keeps lex.json out of this function, which runs on every tap
const lexGloss = (w) => (w && lexicon[w.toLowerCase()]) || null;
// word = lemma or phrase to define, form = the text that was tapped (the glossary is keyed by forms like "est")
export async function GET({ url }) {
  const w = (url.searchParams.get('word') || '').trim();
  if (!w) return json({ g: null });
  const hdr = { 'cache-control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400' }; // s-maxage: Vercel's CDN shares hits across users
  const l = lexGloss(url.searchParams.get('form')) || lexGloss(w); if (l) return json({ g: l }, { headers: hdr });
  try {
    const r = await fetch('https://en.wiktionary.org/api/rest_v1/page/definition/' + encodeURIComponent(w.toLowerCase().replace(/’$/, '').replace(/’/g, "'")),
      { headers: { 'user-agent': 'lire-en-francais/0.1 (personal learning app)' }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return json({ g: null });
    const j = await r.json(); const d = j?.fr?.[0]?.definitions?.[0]?.definition;
    return json({ g: d ? d.replace(/<[^>]+>/g, '').slice(0, 120) : null }, { headers: hdr });
  } catch { return json({ g: null }); }
}
