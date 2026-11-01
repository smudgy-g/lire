import lex from './lex.json';
import { tokenizePlain, key, lemmaOf } from '../tokenize.js';
const lem = (w) => lemmaOf(lex, w);
const MAXP = 6; // longest phrase, in words
// Adds lemma (l) and level (lv) to word tokens and merges known phrases into one token (ph).
// Story key vocabulary (k) keeps its hand-written gloss, so it only gets a level.
export function tag(toks) {
  const out = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (!t.w) { out.push(t); continue; }
    const l = lem(t.s);
    if (t.k) { out.push({ ...t, lv: l ? lex.l[l] : null }); continue; }
    let end = -1, ph;
    for (let j = i, ks = []; j < toks.length && ks.length < MAXP; j++) {
      const u = toks[j];
      if (!u.w) { if (/^\s+$/.test(u.s)) continue; break; } // phrases only span spaces
      if (u.k) break;
      ks.push(lem(u.s) ?? key(u.s));
      if (ks.length > 1 && lex.p[ks.join(' ')]) { end = j; ph = lex.p[ks.join(' ')]; }
    }
    if (end > i) { out.push({ s: toks.slice(i, end + 1).map((x) => x.s).join(''), w: 1, ph: 1, l: ph[0], lv: ph[1] }); i = end; }
    else out.push(l ? { ...t, l: lex.d[l] ?? l, lv: lex.l[l] } : { ...t, lv: null });
  }
  return out;
}
export const annotate = (paras) => paras.map((p) => tag(tokenizePlain(p)));
export function safeUrl(u) {
  const x = new URL(u);
  const h = x.hostname;
  if (!/^https?:$/.test(x.protocol) || h === 'localhost' || h.includes(':') || h.endsWith('.local') ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(h)) throw new Error('URL not allowed');
  return x.href;
}
