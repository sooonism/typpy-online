<script>
  import { onMount } from 'svelte';

  // Gather available game modules from the games folder
  const modules = import.meta.glob('./games/*.svelte');

  const gameKeys = Object.keys(modules).sort();
  const games = gameKeys.map((k) => {
    const file = k.split('/').pop();
    const name = file.replace('.svelte', '');
    return { key: k, name };
  });

  let currentIndex = 0;
  let Component = null;
  let loading = false;

  async function loadByIndex(idx) {
    if (idx < 0 || idx >= games.length) return;
    loading = true;
    const key = games[idx].key;
    const mod = await modules[key]();
    Component = mod.default;
    currentIndex = idx;
    loading = false;
  }

  function randomIndex() {
    if (games.length <= 1) return 0;
    let idx = Math.floor(Math.random() * games.length);
    if (idx === currentIndex) idx = (idx + 1) % games.length;
    return idx;
  }

  function pickRandom() {
    const idx = randomIndex();
    loadByIndex(idx);
  }

  onMount(() => {
    if (games.length) pickRandom();
  });
</script>

<div class="w-full flex flex-col items-center">
  <div class="mb-4 flex items-center gap-3">
    <button
      class="px-4 py-2 rounded-full bg-amber-400 text-gray-900 font-bold hover:bg-amber-300"
      on:click={pickRandom}
    >
      Random
    </button>
    {#if games.length}
      <div class="text-sm text-gray-600 capitalize">{games[currentIndex]?.name}</div>
    {/if}
  </div>

  <div class="w-full">
    {#if loading}
      <div class="text-center text-gray-500">Loading...</div>
    {:else}
      {#if Component}
        <svelte:component this={Component} />
      {/if}
    {/if}
  </div>
</div>
