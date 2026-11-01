import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/env';
import { LANGS, pickLang, type Lang } from './lang.ts';

export interface Card {
	word: string;
	translation: string;
	lang: Lang;
	reviewBox: number;
	dueAt: number;
}

interface LegacyCard {
	f: string;
	t: string;
	lg?: Lang;
	b?: number;
	d?: number;
}

export const toCard = (stored: Card | LegacyCard): Card =>
	'f' in stored
		? {
				word: stored.f,
				translation: stored.t,
				lang: stored.lg ?? 'fr',
				reviewBox: stored.b ?? 0,
				dueAt: stored.d ?? 0
			}
		: stored;

export const cards = writable<Card[]>([]);
export const highlightAboveLevel = writable(2);
export const lang = writable<Lang>('fr');
export const ui = derived(lang, (currentLang) => LANGS[currentLang]);

export const cardsInCurrentLang = derived([cards, lang], ([allCards, currentLang]) =>
	allCards.filter((card) => card.lang === currentLang)
);

let database: IDBDatabase | undefined;
let initialized = false;

const openDatabase = () =>
	new Promise<void>((resolve) => {
		try {
			const request = indexedDB.open('lire', 1);

			request.onupgradeneeded = () => request.result.createObjectStore('kv');

			request.onsuccess = () => {
				database = request.result;
				resolve();
			};

			request.onerror = () => resolve();
		} catch {
			resolve();
		}
	});

const readValue = (key: string) =>
	new Promise<unknown>((resolve) => {
		if (!database) return resolve(null);

		try {
			const request = database.transaction('kv').objectStore('kv').get(key);

			request.onsuccess = () => resolve(request.result ?? null);
			request.onerror = () => resolve(null);
		} catch {
			resolve(null);
		}
	});

const writeValue = (key: string, value: unknown) => {
	if (!database) return;

	try {
		database.transaction('kv', 'readwrite').objectStore('kv').put(value, key);
	} catch {
		return;
	}
};

export async function initStore() {
	if (!browser || initialized) return;
	await openDatabase();
	const storedCards = (await readValue('cards')) as (Card | LegacyCard)[] | null;

	cards.set((storedCards ?? []).map(toCard));
	const storedLevel = Number(localStorage.getItem('level'));

	if (storedLevel) highlightAboveLevel.set(storedLevel);
	lang.set(pickLang(localStorage.getItem('lang')));
	initialized = true;
	cards.subscribe((value) => writeValue('cards', value));
	highlightAboveLevel.subscribe((value) => localStorage.setItem('level', String(value)));

	lang.subscribe((value) => {
		localStorage.setItem('lang', value);
		document.documentElement.lang = value;
	});
}

export const isDue = (card: Card) => card.dueAt <= Date.now();

export const speak = (text: string, slow = false, speechLang: Lang = get(lang)) => {
	try {
		speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(text);

		utterance.lang = LANGS[speechLang].voice;
		utterance.rate = slow ? 0.65 : 0.9;
		speechSynthesis.speak(utterance);
	} catch {
		return;
	}
};
