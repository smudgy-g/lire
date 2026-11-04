# Lire en français

Read French or Spanish stories and real articles with tap-to-translate words, level highlighting, audio and spaced-repetition flashcards. The FR / ES switch in the header changes the feed, stories, lookups, voice, flashcards and interface language. All the interface text lives in `src/lib/lang.js`.

## Pages

- `/` Feed: latest articles for your topics (news, software). Tap one to open it in the reader.
- `/read` Paste an article URL or French text.
- `/stories` Hand-written A2 to B2 stories with glosses and a question.
- `/cards` Saved words, reviewed on a schedule. Export / Import for backup.

## How it works

- `/api/article` fetches a URL, extracts the article text (Readability), splits it into words, and looks up each word's CEFR level.
- Two supplied word lists in `data/` drive the word lookups. `npm run data` turns them into `src/lib/server/lex.json`:
  - `Lexique4.1.tsv` ([Lexique 4.1](http://www.lexique.org), CC BY-SA 4.0; the build reads 3.83 too) maps each inflected form to its lemma, so "prennent" becomes "prendre". Where a form has more than one possible lemma, the most frequent one wins (e.g. "est" becomes "être", not the compass point).
  - `FleLex_CRF.csv` (FLELex) gives each lemma and phrase a CEFR level. The level comes from that entry's most frequent part of speech.
  - FLELex phrases ("tout à fait", "il y a", "d’abord") are matched by their lemmas and shown as one tappable span. Phrases below frequency 0.5 or starting with a subject pronoun are dropped as tagger noise.
  - The build fails with an error if a new copy of either file breaks basic lookups.
- Spanish works the same way and builds `src/lib/server/lex-es.json`:
  - `ELELex.tsv` ([ELELex](https://cental.uclouvain.be/cefrlex/elelex/download/), CC BY-NC-SA 4.0) gives the CEFR levels. Its C1 corpus is small, so a level is measured against the word's overall frequency instead of its peak, and number words are fixed at A1.
  - `lemmatization-es.txt` ([lemmatization-lists](https://github.com/michmech/lemmatization-lists), ODbL) maps forms to lemmas. It has no frequencies, so a form takes its most frequent ELELex lemma ("casas" becomes "casa").
  - `node scripts/build-data.mjs es` (or `fr`) rebuilds one language only.
- Tapping a word shows the lemma and its level, looks up the lemma's meaning and saves the card under the lemma. Story key vocabulary keeps its hand-written gloss.
- `/api/define` returns a meaning from `src/lib/server/lexicon.json` (French only), then Wiktionary, and caches it.
- Orange underline = word above the level chosen in the selector. Dotted blue underline = key vocabulary in stories.
- Progress (saved words) lives in the browser (IndexedDB), not on the server. Each card records its language (`lg`); cards saved before Spanish was added have no `lg` and count as French.

## Run

    npm install
    npm run data      # rebuilds lex.json (FLELex + Lexique) and lex-es.json (ELELex + lemmatization-es)
    npm run dev

## Deploy to Vercel

Push to GitHub, import the repo in Vercel, deploy with defaults (adapter-vercel is configured in `vite.config.js`).

- All pages are prerendered as static files; only `/api/*` runs as functions, one per route, so the tap lookup (`/api/define`) stays small and starts fast.
- `/api/define` responses are cached on Vercel's CDN for 30 days, so a word one reader has tapped is instant for the next.
- `src/lib/server/lex.json` and `lex-es.json` are committed. Vercel doesn't need `data/Lexique4.1.tsv` or `data/lemmatization-es.txt` (both are gitignored); download them only to run `npm run data`.

## Before you push publicly

- ELELex is CC BY-NC-SA 4.0 (non-commercial), so `lex-es.json` can't be used in a commercial app.
- Check the FLELex licence on the CEFRLex site. `data/FleLex_CRF.csv` and `lex.json` are derived from it. Keep the repo private until you have. Lexique is CC BY-SA 4.0: credit it, and `lex.json` inherits that licence.
- Verify the feed URLs in `src/lib/feeds.js`; they were not tested from here.
- Some sites block server fetches or sit behind paywalls; use paste-text for those.
- `/api/article` only blocks obvious private addresses. It does not stop every kind of server-side request forgery, so add stricter checks before sharing the app widely.

## Credits

- **FLELex**: Thomas François, Núria Gala, Patrick Watrin and Cédrick Fairon (2014). "FLELex: a graded lexical resource for French foreign learners." LREC 2014. [CEFRLex](https://cental.uclouvain.be/cefrlex/flelex/).
- **Lexique 4.1**: Boris New, Christophe Pallier, Gauvain Schalchli, Jessica Bourgin and Manuel Gimenes (2026). "Lexique 4: a major upgrade of the « Lexique » French Lexical Database." [lexique.org](http://www.lexique.org). Licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). `src/lib/server/lex.json` is derived from it and shared under the same licence.
- **ELELex**: CENTAL, UCLouvain. [CEFRLex](https://cental.uclouvain.be/cefrlex/elelex/). Licensed [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The citation is listed as forthcoming.
- **lemmatization-lists**: Michal Měchura. [GitHub](https://github.com/michmech/lemmatization-lists). Licensed [ODbL](https://opendatacommons.org/licenses/odbl/summary/).
- **Definitions**: [Wiktionary](https://en.wiktionary.org), CC BY-SA 4.0.

## Browser extension

`extension/` is a Chrome extension that brings tap-to-translate to any page. Load it unpacked from `chrome://extensions` (Developer mode), then click the toolbar icon to turn it on for the current tab (badge shows ON); click a word to see its meaning (links still work; Alt+click a link to translate it), click the icon again to turn it off. It calls `/api/define` on `API_BASE` in `extension/background.js` (`https://lire.adamgriff.dev`, which must match `host_permissions` in `manifest.json`; point both at `http://localhost:5173` to test against `pnpm dev`). The privacy policy for the store listing is at `/privacy`. The language comes from the page's `lang` attribute (Spanish if `es`, otherwise French).

## Not built yet

Share target for Android, accounts and sync, more topics, level estimates in the feed list.
