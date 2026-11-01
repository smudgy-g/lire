export const norm = (t) => t.replace(/'/g, '’');
const W = /(\p{L}+’)|(\p{L}[\p{L}-]*)/gu;
export function tokenizePlain(text) {
  text = norm(text); const out = []; let i = 0;
  for (const m of text.matchAll(W)) {
    if (m.index > i) out.push({ s: text.slice(i, m.index) });
    out.push({ s: m[0], w: 1 }); i = m.index + m[0].length;
  }
  if (i < text.length) out.push({ s: text.slice(i) });
  return out;
}
// Lookup key shared by the data build and the server: Lexique writes "oeil", FLELex "œil"
export const key = (w) => norm(w).toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae');
// Lemma key of one word from lex.json ({ f: form -> lemma, l: lemma -> level }), or null if unknown
// Elided forms take their full spelling (qu’ -> que, l’ -> le) and inversions drop the pronoun (dit-elle -> dit)
export const lemmaOf = (lx, w) => { const k = key(w).replace(/’$/, 'e').replace(/(-t)?-(je|tu|il|elle|on|nous|vous|ils|elles|moi|toi)$/, ''); return lx.f[k] ?? (k in lx.l ? k : null); };
// Phrase key: the lemma of each word, space separated ("rend visite à" -> "rendre visite à")
export const phraseKey = (text, lem) => tokenizePlain(text).filter((t) => t.w).map((t) => lem(t.s)).join(' ');
// Stories: [word=meaning] marks key vocabulary with a hand-written gloss
export const tokenizeStory = (text) => text.split('\n\n').map((p) =>
  p.split(/\[([^=\]]+)=([^\]]+)\]/).flatMap((x, i, a) =>
    i % 3 == 0 ? tokenizePlain(x) : i % 3 == 1 ? [{ s: x, w: 1, g: a[i + 1], k: 1 }] : []));
