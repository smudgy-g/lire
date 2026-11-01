// Builds src/lib/server/lex.json from the two supplied word lists:
//   data/FleLex_CRF.csv  lemma (or phrase) -> CEFR level 0..5
//   data/Lexique4.1.tsv  inflected form -> lemma
// Output: { f: form -> lemma, l: lemma -> level, p: phrase key -> [phrase, level], d: lemma key -> spelling where they differ (œ) }
import fs from 'fs';
import { key, phraseKey, lemmaOf } from '../src/lib/tokenize.js';
const tsv = (file) => fs.readFileSync(file, 'utf8').split(/\r?\n/).slice(1).map((r) => r.split('\t'));
// FLELex writes "d' abord", "c' est - à - dire", "week — end"; join them up like running text
const tidy = (w) => w.trim().toLowerCase().replace(/\s*['’]\s*/g, '’').replace(/\s*[-—]\s*/g, '-');

// FLELex: one level per entry, from the row of its most frequent tag (drops tagger noise like "être" as a noun)
const best = new Map();
for (const c of tsv('data/FleLex_CRF.csv')) {
  const w = tidy(c[0] || ''), f = c.slice(2, 8).map(Number), tot = Number(c[8]), max = Math.max(...f);
  if (!w || !(max > 0)) continue;
  const lv = f.findIndex((x) => x >= 0.2 * max);
  if (!best.has(w) || tot > best.get(w).tot) best.set(w, { lv, tot });
}
const l = {}, d = {};
for (const [w, { lv }] of best) if (!/[\s’]/.test(w)) { l[key(w)] = lv; if (key(w) !== w) d[key(w)] = w; }

// Lexique: each form maps to its most frequent lemma that FLELex knows ("sa" -> "son", not Lexique's own "sa")
// Columns are found by header name, so Lexique 3.83 (ortho/lemme/freqfilms2) and 4.x (1_Mot/4_Lemme/10_FreqMot) both work
const LEX = 'data/Lexique4.1.tsv';
const hd = fs.readFileSync(LEX, 'utf8').slice(0, 2000).split(/\r?\n/)[0].split('\t'), col = (re) => hd.findIndex((h) => re.test(h));
const [cf, cl, cn] = [col(/^(1_Mot|ortho)$/), col(/^(4_Lemme|lemme)$/), col(/^(10_FreqMot|freqfilms2)$/)];
if (Math.min(cf, cl, cn) < 0) throw new Error(`${LEX}: missing form/lemma/frequency columns`);
const top = new Map();
for (const c of tsv(LEX)) {
  const form = key(c[cf] || ''), lem = key(c[cl] || ''), n = Number(c[cn]) || 0;
  if (form && lem in l && !/\s/.test(form) && (!top.has(form) || n > top.get(form).n)) top.set(form, { lem, n });
}
const f = {};
for (const [form, { lem }] of top) if (lem !== form) f[form] = lem;
// Lexique lists these determiners/pronouns as their own lemmas; FLELex files them under the masculine singular
Object.assign(f, { la: 'le', les: 'le', sa: 'son', ses: 'son', ma: 'mon', mes: 'mon', ta: 'ton', tes: 'ton', nos: 'notre', vos: 'votre',
  leurs: 'leur', cette: 'ce', cet: 'ce', ces: 'ce', quelques: 'quelque', aucune: 'aucun', ceux: 'celui', celle: 'celui', celles: 'celui', elles: 'elle', ils: 'il' });
l.fois ??= l.foi; // FLELex's tagger merged "fois" into "foi"

// Phrases (and words FLELex writes with an apostrophe, like aujourd’hui) are matched by their lemma sequence
const p = {}, lx = { f, l };
for (const [w, { lv, tot }] of best) {
  // ponytail: frequency cut drops most tagger chunks ("au bal" 0.02) but keeps "au hasard" 0.57; a few like "après jour" 1.1 slip through, curate a stoplist if they annoy
  if (!/[\s’]/.test(w) || tot < 0.5 || /^(je|j’|tu|on|nous|vous|ils|elles) /.test(w)) continue; // pronoun + verb chunks ("tu es")
  const k = phraseKey(w, (s) => lemmaOf(lx, s) ?? key(s));
  if (k && (!p[k] || tot > p[k][2])) p[k] = [w, lv, tot];
}
// "il y a de" is just "il y a" + de; keep the shorter one so it gets a dictionary meaning
for (const k in p) { const m = k.match(/^(.+) (de|du|des|d’|à|au|aux|que|qu’)$/); if (m && p[m[1]]) delete p[k]; else p[k].pop(); }

// Self-check: fails the build if a new copy of either list breaks the basics
const want = { prennent: 'prendre', achètent: 'acheter', sont: 'être', yeux: 'oeil', belle: 'beau' };
for (const w in want) if (lemmaOf(lx, w) !== want[w]) throw new Error(`${w} -> ${lemmaOf(lx, w)}, expected ${want[w]}`);
for (const ph of ['il y a', 'parce qu’', 'd’abord']) if (!p[phraseKey(ph, (s) => lemmaOf(lx, s) ?? key(s))]) throw new Error(`phrase missing: ${ph}`);

fs.writeFileSync('src/lib/server/lex.json', JSON.stringify({ f, l, p, d }));
console.log(Object.keys(f).length, 'forms,', Object.keys(l).length, 'lemmas,', Object.keys(p).length, 'phrases');
