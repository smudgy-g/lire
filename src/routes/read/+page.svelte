<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { Button } from 'bits-ui';
  import Reader from '$lib/Reader.svelte';
  let input = $state(''), doc = $state(null), err = $state(''), busy = $state(false);
  async function go() {
    const v = input.trim(); if (!v) return;
    busy = true; err = ''; doc = null;
    try {
      const r = await fetch('/api/article', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(/^https?:\/\/\S+$/.test(v) ? { url: v } : { text: v }) });
      if (!r.ok) err = (await r.json().catch(() => ({}))).message || 'Une erreur est survenue'; else doc = await r.json();
    } catch { err = 'Erreur réseau'; }
    busy = false;
  }
  onMount(() => { const u = page.url.searchParams.get('url'); if (u) { input = u; go(); } });
</script>
{#if !doc}
  <section class="intro">
    <span class="eyebrow">Lire</span>
    <h1>Votre texte,<br /><em>mot à mot.</em></h1>
    <p class="muted">Collez l’adresse d’un article ou un texte en français.</p>
  </section>
{/if}
<form class="paste" onsubmit={(e) => { e.preventDefault(); go(); }}>
  <textarea rows={doc ? 1 : 4} placeholder="https://… ou un texte en français" bind:value={input} onkeydown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && go()}></textarea>
  <Button.Root type="submit" class="btn primary" disabled={busy || !input.trim()}>{busy ? 'Chargement…' : 'Lire →'}</Button.Root>
</form>
{#if err}<p class="err">{err}</p>{/if}
{#if busy}<div class="card"><div class="skeleton" style="height:28px;width:70%"></div>{#each [0, 1, 2, 3] as _}<div class="skeleton" style="height:16px;margin-top:14px"></div>{/each}</div>{/if}
{#if doc}
  <header class="doc">
    {#if doc.source}<span class="eyebrow">{doc.source}</span>{/if}
    <h1>{doc.title}</h1>
    <ul class="legend muted"><li><span class="u hard">souligné</span> au-dessus de votre niveau</li><li><span class="u saved">surligné</span> déjà enregistré</li><li>Touchez un mot pour sa traduction</li></ul>
  </header>
  <Reader paragraphs={doc.paragraphs} />
{/if}
<style>
  .intro { display: grid; gap: 14px; margin-bottom: 28px; }
  .intro em { color: var(--sage); }
  .intro p { margin: 0; font-size: 16px; }
  .paste { display: grid; gap: 12px; justify-items: end; margin-bottom: 28px; }
  .err { color: var(--acc); font-size: 14px; }
  .doc { display: grid; gap: 14px; margin: 12px 0 28px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
  .doc h1 { font-size: clamp(1.9rem, 5.5vw, 2.6rem); }
  .legend { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 13px; }
  .legend .u { cursor: default; }
</style>
