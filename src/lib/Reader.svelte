<script>
  import { Popover } from 'bits-ui';
  import { cards, level, speak } from '$lib/store.js';
  let { paragraphs = [] } = $props();
  let sel = $state.raw(null), gloss = $state(null), anchor = $state(null), open = $state(false);
  const saved = $derived(new Set($cards.map((c) => c.f)));
  // Cards are saved under the lemma (prennent -> prendre); story key words keep the form their gloss describes
  const front = (t) => (t.g ? t.s : t.l ?? t.s);
  async function tap(e, t) {
    sel = t; anchor = e.currentTarget; open = true; gloss = t.g || null; speak(t.s);
    if (!gloss) { try { const j = await (await fetch(`/api/define?word=${encodeURIComponent(front(t))}&form=${encodeURIComponent(t.s)}`)).json(); if (sel === t) gloss = j.g || '(pas de définition trouvée)'; } catch { if (sel === t) gloss = '(hors ligne)'; } }
  }
  const save = () => { const f = sel && front(sel); if (f && gloss && !gloss.startsWith('(')) cards.update((c) => (c.some((x) => x.f == f) ? c : [...c, { f, t: gloss }])); };
  const lab = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
</script>
<article class="read">
  {#each paragraphs as p}
    <p>{#each p as t}{#if t.w}<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions --><span class="u" class:k={t.k} class:hard={t.lv != null && t.lv > $level} class:saved={saved.has(front(t))} class:sel={open && sel === t} onclick={(e) => tap(e, t)}>{t.s}</span>{:else}{t.s}{/if}{/each}</p>
  {/each}
</article>
<Popover.Root bind:open>
  <Popover.Portal>
    <Popover.Content class="pop" customAnchor={anchor} side="bottom" sideOffset={8} collisionPadding={16} trapFocus={false} onOpenAutoFocus={(e) => e.preventDefault()}>
      {#if sel}
        <div class="pop-head"><span class="pop-word">{sel.s}</span>{#if front(sel) !== sel.s && front(sel) !== sel.s.toLowerCase()}<span class="pop-lemma">→ {front(sel)}</span>{/if}{#if sel.lv != null}<span class="pop-lv">{lab[sel.lv]}</span>{/if}</div>
        <p class="pop-gloss" class:wait={!gloss}>{gloss ?? 'Recherche…'}</p>
        <div class="pop-actions">
          {#if saved.has(front(sel))}<button class="btn" disabled>Enregistré ✓</button>
          {:else}<button class="btn primary" onclick={save} disabled={!gloss || gloss.startsWith('(')}>+ Enregistrer</button>{/if}
          <button class="btn ghost" onclick={() => speak(sel.s, true)} aria-label="Écouter lentement">🔊 Écouter</button>
        </div>
      {/if}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
<style>
  .read { font: 19px/1.8 var(--serif); max-width: 64ch; }
  .read p { margin: 0 0 1.2em; }
</style>
