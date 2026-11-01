<script>
  import { Button, RadioGroup } from 'bits-ui';
  import Reader from '$lib/Reader.svelte';
  import { speak } from '$lib/store.js';
  let { data } = $props();
  const s = $derived(data.story);
  const paras = $derived(data.paragraphs);
  const opts = $derived(s ? s.quiz.options.map((t, i) => ({ t, i: String(i) })).sort(() => Math.random() - 0.5) : []);
  let pick = $state('');
  $effect.pre(() => { s; pick = ''; });
</script>
<a class="back muted" href="/stories">← Histoires</a>
{#if s}
  <header>
    <span class="eyebrow">Niveau {s.level}</span>
    <h1>{s.title}</h1>
    <Button.Root class="btn forest" onclick={() => speak(s.text.replace(/\[([^=\]]+)=[^\]]+\]/g, '$1'))}>▶ Écouter l’histoire</Button.Root>
  </header>
  <Reader paragraphs={paras} />
  <section class="card quiz">
    <span class="eyebrow">Compréhension</span>
    <h3>{s.quiz.question}</h3>
    <RadioGroup.Root class="choices" bind:value={pick} aria-label={s.quiz.question}>
      {#each opts as o}<RadioGroup.Item value={o.i} class={pick === o.i ? (o.i === '0' ? 'right' : 'wrong') : ''}>{o.t}</RadioGroup.Item>{/each}
    </RadioGroup.Root>
    <p class="fb" class:no={pick !== '' && pick !== '0'} aria-live="polite">{pick === '' ? '' : pick === '0' ? 'Correct ! Bien lu.' : 'Pas tout à fait. Relisez le texte.'}</p>
  </section>
{:else}<h1>Histoire introuvable.</h1>{/if}
<style>
  .back { text-decoration: none; display: inline-block; margin-bottom: 20px; }
  .back:hover { color: var(--ink); }
  header { display: grid; gap: 14px; justify-items: start; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
  .quiz { margin-top: 32px; }
  .quiz h3 { font-size: 22px; margin-top: 12px; }
  .fb { min-height: 1.5em; margin: 12px 0 0; font-size: 14px; color: var(--sage); }
  .fb.no { color: var(--acc); }
</style>
