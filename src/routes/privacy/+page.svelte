<svelte:head>
	<title>Privacy · Lire</title>
</svelte:head>

<article class="policy">
	<span class="eyebrow">Privacy</span>
	<h1>Privacy policy</h1>
	<p class="muted">Lire website and Lire browser extension. Last updated 4 November 2026.</p>

	<h2>In short</h2>
	<p>
		Lire has no accounts, no ads, no analytics and no tracking. It does not sell or share your data.
		Apart from the services listed below, the only thing that leaves your device is what's needed to
		look up a word or load an article.
	</p>

	<h2>Browser extension</h2>
	<ul>
		<li>
			The extension does nothing until you click its toolbar button on a tab, and it only works on
			that tab until you turn it off or the page reloads.
		</li>
		<li>
			When you click a word, that word and the page language (French or Spanish) are sent to
			lire.adamgriff.dev to find its meaning. Nothing else from the page is sent: no page address,
			no other text, no personal information.
		</li>
		<li>The extension stores nothing on your device and has no settings or history.</li>
		<li>
			Words are read aloud by your browser’s built-in speech feature. Some browsers use an online
			voice service for this, under the browser maker’s own privacy policy.
		</li>
	</ul>

	<h2>Website</h2>
	<ul>
		<li>
			Your saved word cards and settings (level, language, sound) are kept in your browser’s own
			storage. They are never uploaded. Export and Import save and load a file on your device.
		</li>
		<li>
			When you tap a word, it is sent to our server to find its meaning, as with the extension.
		</li>
		<li>
			When you paste an article address on the Read page, our server fetches that page to extract
			its text. Text you paste directly is sent to the server to be split into words, and is not
			kept.
		</li>
	</ul>

	<h2>Services we use</h2>
	<ul>
		<li>
			Word meanings that aren’t in Lire’s own word list are fetched from
			<a href="https://en.wiktionary.org">Wiktionary</a>. Only the word is sent, from our server,
			not from your browser.
		</li>
		<li>
			The website (not the extension) loads its fonts from
			<a href="https://policies.google.com/privacy">Google Fonts</a>, so your browser contacts
			Google when you open it.
		</li>
		<li>
			The site runs on <a href="https://vercel.com/legal/privacy-policy">Vercel</a>, which keeps
			standard server logs (such as IP address and the address requested) for a short time to run
			and protect the service. Looked-up meanings are cached so repeat lookups are faster; the cache
			holds words, not who looked them up.
		</li>
	</ul>

	<h2>Changes and contact</h2>
	<p>
		If this policy changes, the date above will change too. Questions: use the contact email on the
		Lire listing in the Chrome Web Store.
	</p>
</article>

<style>
	.policy {
		max-width: 64ch;
		font: 17px/1.65 var(--serif);
	}

	h1 {
		margin: 10px 0 6px;
	}

	h2 {
		font-size: 22px;
		margin: 32px 0 8px;
	}

	li {
		margin-bottom: 8px;
	}
</style>
