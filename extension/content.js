// Injected on each toolbar click; the last expression's value (on/off) goes back to background.js.
(() => {
	// Same pattern as src/lib/tokenize.ts; apostrophes are normalised to ’ first.
	const WORD_PATTERN = /(\p{L}+’)|(\p{L}[\p{L}-]*)/gu;

	const TEXT = {
		fr: { loading: 'Recherche…', none: '(pas de définition trouvée)', offline: '(hors ligne)' },
		es: { loading: 'Buscando…', none: '(no se encontró definición)', offline: '(sin conexión)' }
	};

	if (window.__lire) {
		window.__lire.toggle();

		return window.__lire.on;
	}

	const host = document.createElement('div');
	const shadow = host.attachShadow({ mode: 'closed' });

	shadow.innerHTML = `<style>
		.pop { position: absolute; z-index: 2147483647; max-width: 320px; padding: 12px 14px;
			background: #faf7f1; color: #23281f; border: 1px solid #e2dbcf; border-radius: 14px;
			box-shadow: 0 8px 24px -12px rgb(35 40 31 / 0.3); font: 15px/1.4 system-ui, sans-serif; }
		.pop[hidden] { display: none; }
		.head { display: flex; gap: 8px; align-items: center; }
		.word { font: 600 18px Georgia, serif; flex: 1; }
		button { all: unset; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
		button:hover, button:focus-visible { background: #e4e9dc; }
		.gloss { margin: 6px 0 0; }
		.wait { color: #77736a; }
		@media (prefers-color-scheme: dark) {
			.pop { background: #212822; color: #ece6da; border-color: #323b33; }
			button:hover, button:focus-visible { background: #2b3529; }
			.wait { color: #9b998e; }
		}
	</style>
	<div class="pop" role="dialog" hidden>
		<div class="head"><span class="word"></span>
			<button class="say" aria-label="Listen">🔊</button>
			<button class="close" aria-label="Close">✕</button></div>
		<p class="gloss"></p>
	</div>`;

	const pop = shadow.querySelector('.pop');
	const wordEl = shadow.querySelector('.word');
	const glossEl = shadow.querySelector('.gloss');
	let currentWord = null;

	const pageLang = () => (document.documentElement.lang.slice(0, 2) === 'es' ? 'es' : 'fr');

	const speak = (text) => {
		speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(text);

		utterance.lang = pageLang() === 'es' ? 'es-ES' : 'fr-FR';
		utterance.rate = 0.9;
		speechSynthesis.speak(utterance);
	};

	const hide = () => (pop.hidden = true);

	shadow.querySelector('.say').onclick = () => speak(currentWord);
	shadow.querySelector('.close').onclick = hide;

	function wordAt(x, y) {
		const caret = document.caretPositionFromPoint
			? document.caretPositionFromPoint(x, y)
			: document.caretRangeFromPoint?.(x, y);

		const node = caret?.offsetNode ?? caret?.startContainer;
		const offset = caret?.offset ?? caret?.startOffset;

		if (node?.nodeType !== Node.TEXT_NODE) return null;

		for (const match of node.data.replace(/'/g, '’').matchAll(WORD_PATTERN)) {
			if (offset >= match.index && offset < match.index + match[0].length) {
				const range = document.createRange();

				range.setStart(node, match.index);
				range.setEnd(node, match.index + match[0].length);

				return { word: match[0], rect: range.getBoundingClientRect() };
			}
		}

		return null;
	}

	async function onClick(event) {
		if (event.composedPath().includes(host)) return;

		// Links and buttons keep working; Alt+click still translates their words.
		if (!event.altKey && event.target.closest?.('a[href], button, [role="button"]')) return hide();
		const hit = wordAt(event.clientX, event.clientY);

		if (!hit) return hide();
		event.preventDefault();
		event.stopPropagation();

		const lang = pageLang();
		const word = hit.word;

		currentWord = word;
		wordEl.textContent = word;
		glossEl.textContent = TEXT[lang].loading;
		glossEl.className = 'gloss wait';
		pop.style.left = `${hit.rect.left + scrollX}px`;
		pop.style.top = `${hit.rect.bottom + scrollY + 8}px`;
		pop.hidden = false;
		speak(word);

		const response = await chrome.runtime.sendMessage({ word, lang }).catch(() => null);

		if (currentWord !== word) return;
		glossEl.className = 'gloss';

		glossEl.textContent =
			!response || response.error ? TEXT[lang].offline : response.gloss || TEXT[lang].none;
	}

	const onKey = (event) => event.key === 'Escape' && hide();

	window.__lire = {
		on: false,
		toggle() {
			this.on = !this.on;
			const method = this.on ? 'addEventListener' : 'removeEventListener';

			document[method]('click', onClick, true);
			document[method]('keydown', onKey);

			if (this.on) document.body.append(host);
			else host.remove();
		}
	};

	window.__lire.toggle();

	return window.__lire.on;
})();
