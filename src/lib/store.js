import { writable, get } from 'svelte/store';
import { browser } from '$app/env';
export const cards = writable([]);
export const level = writable(2); // 1=A2, 2=B1, 3=B2: words above this are highlighted
let db, ready = false;
const open = () => new Promise((r) => { try { const q = indexedDB.open('lire', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => { db = q.result; r(); }; q.onerror = () => r(); } catch { r(); } });
const kvget = (k) => new Promise((r) => { if (!db) return r(null); try { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => r(q.result ?? null); q.onerror = () => r(null); } catch { r(null); } });
const kvset = (k, v) => { if (db) try { db.transaction('kv', 'readwrite').objectStore('kv').put(v, k); } catch {} };
export async function init() {
  if (!browser || ready) return;
  await open(); cards.set((await kvget('cards')) || []);
  const l = Number(localStorage.getItem('level')); if (l) level.set(l);
  ready = true;
  cards.subscribe((v) => kvset('cards', v)); level.subscribe((v) => localStorage.setItem('level', v));
}
export const speak = (t, slow = false) => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; u.rate = slow ? 0.65 : 0.9; speechSynthesis.speak(u); } catch {} };
