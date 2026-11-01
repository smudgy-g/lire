<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { ToggleGroup } from 'bits-ui';
  import { init, cards, level } from '$lib/store.js';
  let { children } = $props();
  onMount(init);
  const nav = [['/', 'Feed'], ['/read', 'Lire'], ['/stories', 'Histoires'], ['/cards', 'Cartes']];
  const on = (h) => (h === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(h) || (h === '/stories' && page.url.pathname.startsWith('/story')));
  const due = $derived($cards.filter((c) => !c.d || c.d <= Date.now()).length);
</script>
<header>
  <div class="bar">
    <a href="/" class="mark">Lire<span>en français</span></a>
    <nav>{#each nav as [h, l]}<a href={h} aria-current={on(h) ? 'page' : undefined}>{l}{#if h === '/cards' && due}<span class="badge">{due}</span>{/if}</a>{/each}</nav>
    <div class="lv" title="Souligner les mots au-dessus de ce niveau">
      <span class="eyebrow">Niveau</span>
      <ToggleGroup.Root type="single" class="toggles" value={String($level)} onValueChange={(v) => v && level.set(+v)} aria-label="Niveau">
        {#each ['A2', 'B1', 'B2'] as l, i}<ToggleGroup.Item value={String(i + 1)}>{l}</ToggleGroup.Item>{/each}
      </ToggleGroup.Root>
    </div>
  </div>
</header>
<main>{@render children()}</main>
<footer class="muted">
  Niveaux : <a href="https://cental.uclouvain.be/cefrlex/flelex/">FLELex</a> (François et al., 2014) ·
  Lemmes : <a href="http://www.lexique.org">Lexique 4.1</a> (New, Pallier et al.), <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> ·
  Définitions : <a href="https://en.wiktionary.org">Wiktionary</a>
</footer>
<style>
  header { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
  .bar { max-width: 760px; margin: 0 auto; padding: 14px 20px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 24px; }
  .mark { font: 500 15px/1 var(--serif); letter-spacing: .22em; text-transform: uppercase; text-decoration: none; display: flex; align-items: baseline; gap: 8px; }
  .mark span { font: italic 400 14px var(--serif); letter-spacing: 0; text-transform: none; color: var(--mute); }
  nav { display: flex; gap: 22px; }
  nav a { font: 500 13px/1 var(--sans); color: var(--mute); text-decoration: none; padding: 8px 0; border-bottom: 1.5px solid transparent; display: flex; align-items: center; gap: 6px; }
  nav a:hover { color: var(--ink); }
  nav a[aria-current] { color: var(--ink); border-color: var(--acc); }
  .badge { font: 600 10px/1 var(--sans); background: var(--acc); color: var(--acc-ink); border-radius: 999px; padding: 3px 6px; }
  .lv { display: flex; align-items: center; gap: 10px; }
  .lv .eyebrow::after { display: none; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 20px 96px; }
  footer { max-width: 760px; margin: 0 auto; padding: 0 20px 32px; font-size: 12px; }
  footer a { color: inherit; }
  @media (max-width: 680px) {
    .bar { grid-template-columns: 1fr auto; gap: 10px 12px; padding: 12px 16px 0; }
    .mark span, .lv .eyebrow { display: none; }
    nav { grid-column: 1 / -1; order: 3; justify-content: space-between; }
    nav a { padding: 10px 0 12px; }
    main { padding: 24px 16px 96px; }
  }
</style>
