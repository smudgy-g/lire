<script>
  import stories from '$lib/stories.json';
  const plain = (t) => t.replace(/\[([^=\]]+)=[^\]]+\]/g, '$1');
</script>
<section class="intro">
  <span class="eyebrow">Histoires</span>
  <h1>Petites histoires,<br /><em>grands progrès.</em></h1>
  <p class="muted">Des textes courts de A2 à B2, avec le vocabulaire clé et une question.</p>
</section>
<div class="grid">
  {#each stories as s, i}
    <a class="card" href={'/story/' + s.id}>
      <span class="eyebrow">{String(i + 1).padStart(2, '0')} · {s.level}</span>
      <h3>{s.title}</h3>
      <p>{plain(s.text).slice(0, 120)}…</p>
    </a>
  {/each}
</div>
<style>
  .intro { display: grid; gap: 14px; margin-bottom: 32px; }
  .intro em { color: var(--sage); }
  .intro p { margin: 0; font-size: 16px; }
  .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  h3 { font-size: 24px; margin: 14px 0 8px; }
  .card p { margin: 0; color: var(--mute); font: 16px/1.55 var(--serif); }
</style>
