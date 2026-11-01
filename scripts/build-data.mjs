import fs from 'fs';
import { lookupKey, phraseKey, lemmaOf } from '../src/lib/tokenize.ts';

const readTsvRows = (file) =>
	fs
		.readFileSync(file, 'utf8')
		.replace(/^\uFEFF/, '')
		.split(/\r?\n/)
		.slice(1)
		.map((row) => row.split('\t'));

const peakFrequency = (frequencies) => Math.max(...frequencies);

const isMultiWord = (entry) => /[\s’]/.test(entry);

const LEVEL_THRESHOLD_RATIO = 0.2;
const MIN_PHRASE_FREQUENCY = 0.5;

function assignLevels(entries, referenceFrequency = peakFrequency) {
	const levelsByEntry = new Map();

	for (const [entry, frequenciesByLevel, totalFrequency, tag] of entries) {
		if (!entry || !(peakFrequency(frequenciesByLevel) > 0)) continue;
		const reference = referenceFrequency(frequenciesByLevel, totalFrequency);

		if (!levelsByEntry.has(entry) || totalFrequency > levelsByEntry.get(entry).totalFrequency)
			levelsByEntry.set(entry, {
				level: frequenciesByLevel.findIndex(
					(frequency) => frequency >= LEVEL_THRESHOLD_RATIO * reference
				),
				totalFrequency,
				tag
			});
	}

	return levelsByEntry;
}

function buildLexicon(
	outputFile,
	levelsByEntry,
	formLemmaPairs,
	{
		lemmaOverrides,
		levelAliases = {},
		shouldDropPhrase,
		redundantPhraseTail,
		expectedLemmas,
		expectedPhrases
	}
) {
	const lemmaLevels = {};
	const displaySpellings = {};

	for (const [entry, { level }] of levelsByEntry) {
		if (isMultiWord(entry)) continue;
		const key = lookupKey(entry);

		lemmaLevels[key] = level;
		if (key !== entry) displaySpellings[key] = entry;
	}

	const mostFrequentLemmaByForm = new Map();

	for (const [rawForm, rawLemma, count] of formLemmaPairs) {
		const form = lookupKey(rawForm || '');
		const lemma = lookupKey(rawLemma || '');

		const isBetterCandidate =
			!mostFrequentLemmaByForm.has(form) || count > mostFrequentLemmaByForm.get(form).count;

		if (form && lemma in lemmaLevels && !/\s/.test(form) && isBetterCandidate)
			mostFrequentLemmaByForm.set(form, { lemma, count });
	}

	const formToLemma = {};

	for (const [form, { lemma }] of mostFrequentLemmaByForm)
		if (lemma !== form) formToLemma[form] = lemma;
	Object.assign(formToLemma, lemmaOverrides);
	for (const alias in levelAliases) lemmaLevels[alias] ??= lemmaLevels[levelAliases[alias]];

	const lexicon = { formToLemma, lemmaLevels };
	const toLemmaOrKey = (word) => lemmaOf(lexicon, word) ?? lookupKey(word);
	const phraseCandidates = {};

	for (const [entry, details] of levelsByEntry) {
		const isPhraseCandidate =
			isMultiWord(entry) &&
			details.totalFrequency >= MIN_PHRASE_FREQUENCY &&
			!shouldDropPhrase(entry, details);

		if (!isPhraseCandidate) continue;
		const key = phraseKey(entry, toLemmaOrKey);
		const existing = phraseCandidates[key];

		if (key && (!existing || details.totalFrequency > existing.totalFrequency))
			phraseCandidates[key] = { phrase: entry, ...details };
	}

	const phrases = {};

	for (const key in phraseCandidates) {
		const tailMatch = key.match(redundantPhraseTail);
		const isRedundant = tailMatch && phraseCandidates[tailMatch[1]];

		if (!isRedundant) phrases[key] = [phraseCandidates[key].phrase, phraseCandidates[key].level];
	}

	for (const word in expectedLemmas) {
		const actual = lemmaOf(lexicon, word);

		if (actual !== expectedLemmas[word])
			throw new Error(`${outputFile}: ${word} -> ${actual}, expected ${expectedLemmas[word]}`);
	}

	for (const phrase of expectedPhrases)
		if (!phrases[phraseKey(phrase, toLemmaOrKey)])
			throw new Error(`${outputFile}: phrase missing: ${phrase}`);

	fs.writeFileSync(
		outputFile,
		JSON.stringify({ formToLemma, lemmaLevels, phrases, displaySpellings })
	);

	console.log(
		outputFile,
		Object.keys(formToLemma).length,
		'forms,',
		Object.keys(lemmaLevels).length,
		'lemmas,',
		Object.keys(phrases).length,
		'phrases'
	);
}

function findColumn(headers, pattern) {
	return headers.findIndex((header) => pattern.test(header));
}

function buildFrench() {
	const normalizeFlelexEntry = (entry) =>
		entry
			.trim()
			.toLowerCase()
			.replace(/\s*['’]\s*/g, '’')
			.replace(/\s*[-—]\s*/g, '-');

	const levelsByEntry = assignLevels(
		readTsvRows('data/FleLex_CRF.csv').map((columns) => [
			normalizeFlelexEntry(columns[0] || ''),
			columns.slice(2, 8).map(Number),
			Number(columns[8]),
			columns[1]
		])
	);

	const LEXIQUE_FILE = 'data/Lexique4.1.tsv';

	const lexiqueHeaders = fs
		.readFileSync(LEXIQUE_FILE, 'utf8')
		.slice(0, 2000)
		.split(/\r?\n/)[0]
		.split('\t');

	const formColumn = findColumn(lexiqueHeaders, /^(1_Mot|ortho)$/);
	const lemmaColumn = findColumn(lexiqueHeaders, /^(4_Lemme|lemme)$/);
	const frequencyColumn = findColumn(lexiqueHeaders, /^(10_FreqMot|freqfilms2)$/);

	if (Math.min(formColumn, lemmaColumn, frequencyColumn) < 0)
		throw new Error(`${LEXIQUE_FILE}: missing form/lemma/frequency columns`);

	buildLexicon(
		'src/lib/server/lex.json',
		levelsByEntry,
		readTsvRows(LEXIQUE_FILE).map((columns) => [
			columns[formColumn],
			columns[lemmaColumn],
			Number(columns[frequencyColumn]) || 0
		]),
		{
			lemmaOverrides: {
				la: 'le',
				les: 'le',
				sa: 'son',
				ses: 'son',
				ma: 'mon',
				mes: 'mon',
				ta: 'ton',
				tes: 'ton',
				nos: 'notre',
				vos: 'votre',
				leurs: 'leur',
				cette: 'ce',
				cet: 'ce',
				ces: 'ce',
				quelques: 'quelque',
				aucune: 'aucun',
				ceux: 'celui',
				celle: 'celui',
				celles: 'celui',
				elles: 'elle',
				ils: 'il'
			},
			levelAliases: { fois: 'foi' },
			shouldDropPhrase: (phrase) => /^(je|j’|tu|on|nous|vous|ils|elles) /.test(phrase),
			redundantPhraseTail: /^(.+) (de|du|des|d’|à|au|aux|que|qu’)$/,
			expectedLemmas: {
				prennent: 'prendre',
				achètent: 'acheter',
				sont: 'être',
				yeux: 'oeil',
				belle: 'beau'
			},
			expectedPhrases: ['il y a', 'parce qu’', 'd’abord']
		}
	);
}

const SPANISH_NUMBERS =
	'uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte treinta cuarenta cincuenta sesenta setenta ochenta noventa cien ciento mil'.split(
		' '
	);

function buildSpanish() {
	const stripQuotes = (value) => value.replace(/"/g, '');

	const normalizeElelexEntry = (entry) =>
		stripQuotes(entry)
			.replace(/_/g, ' ')
			.replace(
				/(^| )(a|de) el(?= |$)/g,
				(_, separator, preposition) => separator + (preposition === 'a' ? 'al' : 'del')
			);

	const levelsByEntry = assignLevels(
		readTsvRows('data/ELELex.tsv').map((columns) => [
			normalizeElelexEntry(columns[0] || ''),
			columns.slice(2, 7).map((value) => Number(stripQuotes(value))),
			Number(stripQuotes(columns[7] || '')),
			stripQuotes(columns[1] || '')
		]),
		(frequenciesByLevel, totalFrequency) =>
			Math.min(totalFrequency, peakFrequency(frequenciesByLevel))
	);

	for (const number of SPANISH_NUMBERS)
		levelsByEntry.set(number, { level: 0, totalFrequency: Infinity, tag: 'Z' });

	const totalFrequencyOf = (lemma) => levelsByEntry.get(lemma)?.totalFrequency ?? 0;

	const formLemmaPairs = readTsvRows('data/lemmatization-es.txt').map(([lemma, form]) => [
		form,
		lemma,
		totalFrequencyOf(lemma)
	]);

	for (const lemma of levelsByEntry.keys())
		formLemmaPairs.push([lemma, lemma, totalFrequencyOf(lemma)]);

	buildLexicon('src/lib/server/lex-es.json', levelsByEntry, formLemmaPairs, {
		lemmaOverrides: { como: 'como', nos: 'nos', os: 'os' },
		shouldDropPhrase: (phrase, { tag }) =>
			/^(NP|PR)/.test(tag) ||
			/^(yo|tú|él|ella|nosotros|vosotros|ellos|ellas|usted|ustedes) /.test(phrase),
		redundantPhraseTail: /^(.+) (de|del|a|al|que|en|con|por|para)$/,
		expectedLemmas: {
			tengo: 'tener',
			casas: 'casa',
			es: 'ser',
			las: 'el',
			niñas: 'niño',
			como: 'como',
			dos: 'dos'
		},
		expectedPhrases: ['de acuerdo', 'a medida que']
	});
}

const onlyLanguage = process.argv[2];

if (!onlyLanguage || onlyLanguage === 'fr') buildFrench();
if (!onlyLanguage || onlyLanguage === 'es') buildSpanish();
