<script>
  import { Button } from 'bits-ui';
  import { cards, speak } from '$lib/store.js';
  let flip = $state(false);
  const due = $derived($cards.filter((c) => !c.d || c.d <= Date.now()));
  const c = $derived(due[0]);
  function grade(ok) {
    const D = [0, 1, 3, 7, 14, 30], i = $cards.indexOf(c);
    cards.update((a) => { const x = { ...a[i] }; x.b = ok ? Math.min((x.b || 0) + 1, 5) : 0; x.d = Date.now() + D[x.b] * 864e5 + (ok ? 0 : 6e4); a[i] = x; return [...a]; });
    flip = false;
  }
  const turn = () => { flip = !flip; if (flip) speak(c.f); };
  function exp() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ cards: $cards }, null, 1)], { type: 'application/json' })); a.download = 'lire-progress.json'; a.click(); }
  async function imp(e) { try { const d = JSON.parse(await e.target.files[0].text()); cards.set(d.cards || []); } catch { alert('Fichier invalide'); } }
</script>
<section class="intro">
  <span class="eyebrow">Cartes</span>
  <h1>Révisez,<br /><em>un mot à la fois.</em></h1>
  <p class="muted">{$cards.length} mot{$cards.length === 1 ? '' : 's'} enregistré{$cards.length === 1 ? '' : 's'} · {due.length} à réviser</p>
</section>
{#if !$cards.length}
  <div class="card empty"><h3>Aucune carte pour l’instant.</h3><p class="muted">Pendant la lecture, touchez un mot puis « Enregistrer ».</p><Button.Root href="/stories" class="btn primary">Lire une histoire →</Button.Root></div>
{:else if !c}
  <div class="card empty"><h3>Tout est à jour.</h3><p class="muted">Revenez plus tard : vos {$cards.length} cartes sont programmées.</p></div>
{:else}
  <button class="flash" class:flip onclick={turn} aria-label={flip ? 'Montrer le mot' : 'Montrer la traduction'}>
    <span class="face front"><span class="eyebrow">Français</span><span class="word">{c.f}</span><span class="muted">Touchez pour retourner</span></span>
    <span class="face back"><span class="eyebrow">Traduction</span><span class="word">{c.t}</span><span class="muted">{c.f}</span></span>
  </button>
  <div class="grade">
    <Button.Root class="btn" onclick={() => grade(false)}>↺ Encore</Button.Root>
    <Button.Root class="btn forest" onclick={() => grade(true)}>Je sais ✓</Button.Root>
  </div>
{/if}
<div class="io">
  <Button.Root class="btn ghost" onclick={exp}>Exporter</Button.Root>
  <label class="btn ghost">Importer<input type="file" accept=".json" hidden onchange={imp} /></label>
</div>
<style>
  .intro { display: grid; gap: 14px; margin-bottom: 28px; }
  .intro em { color: var(--sage); }
  .intro p { margin: 0; }
  .empty { display: grid; gap: 10px; justify-items: start; }
  .empty h3 { font-size: 22px; }
  .empty p { margin: 0 0 6px; }
  .flash { display: grid; width: 100%; min-height: 260px; padding: 0; border: 0; background: none; color: inherit; cursor: pointer; perspective: 1200px; font: inherit; }
  .face { grid-area: 1 / 1; display: grid; place-content: center; justify-items: center; gap: 14px; padding: 32px; border-radius: 24px; border: 1px solid var(--line); background: var(--paper); box-shadow: var(--shadow); backface-visibility: hidden; transition: transform .45s cubic-bezier(.2, .7, .2, 1); }
  .face .eyebrow::after { display: none; }
  .back { transform: rotateY(180deg); background: var(--forest); color: var(--bg); border-color: var(--forest); }
  .back .eyebrow, .back .muted { color: color-mix(in srgb, var(--bg) 70%, transparent); }
  .flip .front { transform: rotateY(-180deg); }
  .flip .back { transform: rotateY(0); }
  .word { font: 400 clamp(2rem, 8vw, 2.8rem)/1.15 var(--serif); text-align: center; }
  .grade { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .grade :global(.btn) { padding: 16px; }
  .io { display: flex; justify-content: center; gap: 8px; margin-top: 32px; }
</style>
