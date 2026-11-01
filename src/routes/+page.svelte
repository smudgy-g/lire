<script>
  import { onMount } from 'svelte';
  import { ToggleGroup } from 'bits-ui';
  let items = $state([]), topics = $state(['news', 'software']), loading = $state(true), failed = $state(0);
  async function load() {
    loading = true;
    try { const j = await (await fetch('/api/feed?topics=' + topics.join(','))).json(); items = j.items; failed = j.failed; } catch { items = []; }
    loading = false;
  }
  onMount(() => { try { topics = JSON.parse(localStorage.getItem('topics')) || topics; } catch {} load(); });
  function pick(v) { topics = v; localStorage.setItem('topics', JSON.stringify(v)); load(); }
  const names = { news: 'Actualités', software: 'Logiciel' };
  const day = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '');
</script>
<section class="hero">
  <span class="eyebrow">Le fil du jour</span>
  <h1>Lisez le monde,<br /><em>en français.</em></h1>
  <p class="muted">Des articles récents. Touchez un mot pour sa traduction.</p>
  <ToggleGroup.Root type="multiple" class="toggles" value={topics} onValueChange={pick} aria-label="Sujets">
    {#each Object.entries(names) as [t, n]}<ToggleGroup.Item value={t}>{n}</ToggleGroup.Item>{/each}
  </ToggleGroup.Root>
</section>
<div class="list" aria-busy={loading}>
  {#if loading}
    {#each [0, 1, 2] as _}<div class="card"><div class="skeleton" style="height:10px;width:30%"></div><div class="skeleton" style="height:22px;width:85%;margin:14px 0 10px"></div><div class="skeleton" style="height:14px;width:95%"></div></div>{/each}
  {:else}
    {#each items as i}
      <a class="card item" href={'/read?url=' + encodeURIComponent(i.link)}>
        <span class="eyebrow">{i.source}{#if i.date}{` · ${day(i.date)}`}{/if}</span>
        <h3>{i.title}</h3>
        {#if i.summary}<p>{i.summary}</p>{/if}
        <span class="go">Lire l’article →</span>
      </a>
    {:else}
      <div class="card empty"><h3>Rien pour l’instant.</h3><p class="muted">Aucun article trouvé pour ces sujets. Réessayez plus tard, ou collez un texte dans <a href="/read">Lire</a>.</p></div>
    {/each}
    {#if failed}<p class="muted">{failed} source(s) indisponible(s).</p>{/if}
  {/if}
</div>
<style>
  .hero { display: grid; gap: 14px; justify-items: start; margin-bottom: 32px; }
  .hero em { color: var(--sage); }
  .hero p { margin: 0 0 6px; font-size: 16px; }
  .list { display: grid; gap: 14px; }
  .item h3 { font-size: 23px; line-height: 1.25; margin: 12px 0 8px; }
  .item p { margin: 0; color: var(--mute); font-size: 15px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .go { display: inline-block; margin-top: 14px; font: 500 13px var(--sans); color: var(--acc); }
  .empty h3 { font-size: 22px; margin-bottom: 6px; }
</style>
