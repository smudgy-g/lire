import { json, error } from '@sveltejs/kit';
import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';
import { annotate, safeUrl } from '$lib/server/nlp.js';
export async function POST({ request }) {
  const { url, text } = await request.json();
  let title = 'Pasted text', paras = [], source = '';
  if (url) {
    let href; try { href = safeUrl(url); } catch { throw error(400, 'Invalid or disallowed URL'); }
    let html;
    try {
      const r = await fetch(href, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; lire-en-francais/0.1)', 'accept-language': 'fr' }, signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw 0; html = await r.text();
    } catch { throw error(502, 'Could not fetch that page. Paste the text instead.'); }
    const { document } = parseHTML(html);
    const art = new Readability(document).parse();
    if (!art) throw error(422, 'Could not find article text. Paste the text instead.');
    title = art.title || href; source = new URL(href).hostname;
    paras = [...parseHTML(art.content).document.querySelectorAll('p,h1,h2,h3,li')].map((e) => e.textContent.trim()).filter(Boolean);
  } else if (text) paras = String(text).split(/\n+/).map((s) => s.trim()).filter(Boolean);
  paras = paras.slice(0, 300).map((p) => p.slice(0, 2000));
  if (!paras.length) throw error(422, 'No text found');
  return json({ title, source, paragraphs: annotate(paras) });
}
