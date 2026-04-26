<script>
  import { onMount, onDestroy } from 'svelte';

  // ──────────────────────────────────────
  // Word bank
  // ──────────────────────────────────────
  const wordBank = [
    'cat', 'dog', 'sun', 'moon', 'star', 'rain', 'wind', 'fire', 'tree', 'bird',
    'fish', 'wave', 'code', 'type', 'fast', 'quick', 'swift', 'blast', 'dash', 'zoom',
    'cloud', 'storm', 'light', 'dark', 'night', 'dream', 'ocean', 'river', 'stone', 'bloom',
    'spark', 'flame', 'frost', 'echo', 'pulse', 'vivid', 'brave', 'crisp', 'flash', 'glide',
    'haste', 'leap', 'mist', 'nova', 'prism', 'quest', 'roar', 'shine', 'thunder', 'vortex',
    'wonder', 'zenith', 'aurora', 'breeze', 'cosmic', 'dragon', 'falcon', 'galaxy', 'horizon',
    'infinity', 'journey', 'knight', 'legend', 'mystic', 'nebula', 'phoenix', 'quantum', 'rocket',
    'shadow', 'titan', 'ultra', 'velocity', 'whisper', 'xenon', 'yonder', 'zephyr', 'anchor',
    'beacon', 'cipher', 'ember', 'frostbite'
  ];

  // ──────────────────────────────────────
  // Game state
  // ──────────────────────────────────────
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let lives = 5;
  let level = 1;
  let wordsCleared = 0;
  let gameRunning = false;
  let gameOver = false;
  let fallingWords = [];
  let typedText = '';
  let wordIdCounter = 0;

  // Refs
  let gameAreaEl;
  let typingInputEl;
  let bgParticlesEl;

  // Intervals & anim frame
  let spawnTimer;
  let updateLoop;
  let audioCtx;

  // Constants
  const maxLives = 5;
  const baseSpawnInterval = 2200;
  const baseFallSpeed = 0.35;

  // ──────────────────────────────────────
  // Audio helpers
  // ──────────────────────────────────────
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playBeep(freq, duration, type = 'sine', vol = 0.08) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* silently fail */ }
  }

  function sfxCorrect() { playBeep(600, 0.12); playBeep(900, 0.1); }
  function sfxCombo() { playBeep(400, 0.08, 'triangle', 0.05); playBeep(800, 0.06, 'square', 0.03); }
  function sfxMiss() { playBeep(150, 0.3, 'sawtooth', 0.07); }
  function sfxGameOver() { playBeep(100, 0.5, 'sawtooth', 0.1); playBeep(60, 0.6, 'triangle', 0.08); }
  function sfxLevelUp() {
    playBeep(500, 0.07);
    setTimeout(() => playBeep(700, 0.07), 80);
    setTimeout(() => playBeep(1000, 0.1), 160);
  }

  // ──────────────────────────────────────
  // Background particles
  // ──────────────────────────────────────
  function createBgParticles() {
    if (!bgParticlesEl) return;
    bgParticlesEl.innerHTML = '';
    const count = 30;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 3 + 1.5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.bottom = -(Math.random() * 30) + 'px';
      p.style.animationDuration = (Math.random() * 12 + 8) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      bgParticlesEl.appendChild(p);
    }
  }

  // ──────────────────────────────────────
  // Game logic
  // ──────────────────────────────────────
  function getRandomWord() {
    const maxLen = Math.min(3 + Math.floor(level / 2), 8);
    const filtered = wordBank.filter(w => w.length <= maxLen && w.length >= 3);
    const pool = filtered.length ? filtered : wordBank;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function getSpawnInterval() {
    return Math.max(800, baseSpawnInterval - (level - 1) * 150);
  }

  function getFallSpeed() {
    return baseFallSpeed + (level - 1) * 0.08;
  }

  function calculateScore(wordLen) {
    const base = wordLen * 10;
    const comboBonus = combo > 1 ? Math.floor(combo * wordLen * 3) : 0;
    const levelBonus = level * 5;
    return base + comboBonus + levelBonus;
  }

  function spawnWord() {
    if (!gameRunning || gameOver) return;
    const word = getRandomWord();
    const id = wordIdCounter++;
    const areaWidth = gameAreaEl.clientWidth;
    const maxX = areaWidth - 80; // approximate width
    const x = Math.max(5, Math.random() * maxX);
    const y = -30 - Math.random() * 60;

    fallingWords = [
      ...fallingWords,
      {
        id,
        word,
        x,
        y,
        speed: getFallSpeed() + Math.random() * 0.15,
        isDanger: false,
        isPartial: false
      }
    ];
  }

  function removeWord(id) {
    fallingWords = fallingWords.filter(w => w.id !== id);
  }

  function wordReachedBottom(id) {
    const fw = fallingWords.find(w => w.id === id);
    if (!fw || !gameRunning || gameOver) return;
    sfxMiss();
    lives--;
    combo = 0;
    removeWord(id);
    // Shake input
    typingInputEl?.classList.add('shake-input');
    setTimeout(() => typingInputEl?.classList.remove('shake-input'), 400);
    if (lives <= 0) {
      endGame();
    }
    // Trigger reactivity
    fallingWords = fallingWords;
  }

  function processTypedWord() {
    if (!gameRunning || gameOver) return;
    const typed = typedText.trim().toLowerCase();
    if (!typed) return;

    const matches = fallingWords.filter(fw => fw.word.toLowerCase() === typed);
    if (matches.length > 0) {
      // Pick the closest to bottom (highest y)
      let best = matches[0];
      for (const m of matches) {
        if (m.y > best.y) best = m;
      }

      combo++;
      if (combo > maxCombo) maxCombo = combo;
      const points = calculateScore(best.word.length);
      score += points;

      if (combo % 5 === 0) sfxCombo();
      else sfxCorrect();

      wordsCleared++;
      const newLevel = Math.floor(wordsCleared / 8) + 1;
      if (newLevel > level) {
        level = newLevel;
        sfxLevelUp();
        clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnWord, getSpawnInterval());
      }

      removeWord(best.id);
      typedText = '';
    } else {
      // No match – reset combo
      combo = 0;
      sfxMiss();
      typedText = '';
      // Shake input
      typingInputEl?.classList.add('shake-input');
      setTimeout(() => typingInputEl?.classList.remove('shake-input'), 400);
    }
    typingInputEl?.focus();
  }

  function updatePartialHighlight() {
    const typed = typedText.trim().toLowerCase();
    // Reset all partial flags
    fallingWords.forEach(w => (w.isPartial = false));
    if (!typed) return;
    let best = null;
    let bestY = -Infinity;
    for (const w of fallingWords) {
      if (w.word.toLowerCase().startsWith(typed) && w.y > bestY) {
        bestY = w.y;
        best = w;
      }
    }
    if (best) best.isPartial = true;
    // Trigger reactivity
    fallingWords = fallingWords;
  }

  function gameLoop() {
    if (!gameRunning || gameOver) return;
    const areaHeight = gameAreaEl?.clientHeight || 600;
    const dangerY = areaHeight - 55;

    let changed = false;
    for (let i = fallingWords.length - 1; i >= 0; i--) {
      const w = fallingWords[i];
      w.y += w.speed;
      w.isDanger = w.y > dangerY - 40 && w.y <= dangerY;
      if (w.y >= dangerY) {
        wordReachedBottom(w.id);
        changed = true;
      }
    }
    if (changed) {
      // Some words removed, no need to reassign
    } else {
      // Force reactivity
      fallingWords = fallingWords;
    }
    updateLoop = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    initAudio();
    score = 0;
    combo = 0;
    maxCombo = 0;
    lives = maxLives;
    level = 1;
    wordsCleared = 0;
    fallingWords = [];
    wordIdCounter = 0;
    typedText = '';
    gameRunning = true;
    gameOver = false;

    clearInterval(spawnTimer);
    if (updateLoop) cancelAnimationFrame(updateLoop);

    spawnTimer = setInterval(spawnWord, getSpawnInterval());
    setTimeout(spawnWord, 400);
    setTimeout(spawnWord, 800);
    updateLoop = requestAnimationFrame(gameLoop);
  }

  function endGame() {
    gameRunning = false;
    gameOver = true;
    clearInterval(spawnTimer);
    if (updateLoop) cancelAnimationFrame(updateLoop);
    sfxGameOver();
    typedText = '';
    fallingWords = [];
  }

  function restartGame() {
    endGame();
    startGame();
  }

  // ──────────────────────────────────────
  // Keyboard shortcuts & focus
  // ──────────────────────────────────────
  function handleKeydown(e) {
    if (e.key === 'Enter') {
      if (!gameRunning && !gameOver) {
        startGame();
      } else if (gameRunning && !gameOver) {
        processTypedWord();
      }
    }
    if (e.key === 'r' && e.ctrlKey && gameOver) {
      e.preventDefault();
      restartGame();
    }
  }

  function focusInput() {
    if (gameRunning && !gameOver) typingInputEl?.focus();
  }

  // ──────────────────────────────────────
  // Reactive statements
  // ──────────────────────────────────────
  $: if (gameRunning && !gameOver) updatePartialHighlight();

  // ──────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────
  onMount(() => {
    createBgParticles();
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    clearInterval(spawnTimer);
    if (updateLoop) cancelAnimationFrame(updateLoop);
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<main class="relative min-h-screen bg-background font-body flex items-center justify-center overflow-hidden">
  <!-- Background particles container -->
  <div class="bg-particles fixed inset-0 pointer-events-none z-0" bind:this={bgParticlesEl}></div>

  <!-- Game card -->
  <div class="relative z-10 w-full max-w-2xl h-[600px] flex flex-col rounded-3xl shadow-2xl overflow-hidden bg-surface border border-outline-variant">
    
    <!-- HUD -->
    <div class="flex flex-wrap justify-between items-center px-6 py-4 gap-4 bg-surface-container-high/80 backdrop-blur-sm border-b border-outline-variant">
      <div class="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
        <span class="text-lg">⭐</span> Score:
        <span class="text-lg font-extrabold text-primary min-w-[40px] text-center">{score}</span>
      </div>
      <div class="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
        <span class="text-lg">🔥</span> Combo:
        <span class="text-lg font-extrabold text-tertiary min-w-[40px] text-center">{combo}</span>
      </div>
      <div class="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
        <span class="text-lg">📈</span> Level:
        <span class="text-lg font-extrabold text-success-green min-w-[40px] text-center">{level}</span>
      </div>
      <div class="flex items-center gap-0.5 text-xl">
        {#each Array(maxLives) as _, i}
          <span class="text-error" style="opacity: {i < lives ? 1 : 0.25};">❤️</span>
        {/each}
      </div>
    </div>

    <!-- Game area -->
    <div
      class="flex-1 relative overflow-hidden bg-gradient-to-b from-transparent to-primary-fixed/20"
      bind:this={gameAreaEl}
      on:click={focusInput}
    >
      <div class="absolute bottom-12 left-[5%] w-[90%] h-0.5 bg-gradient-to-r from-transparent via-error to-transparent opacity-60 shadow-[0_0_20px_rgba(186,26,26,0.4)] danger-glow pointer-events-none"></div>
      
      <!-- Falling words -->
      {#each fallingWords as word (word.id)}
        <div
          class="falling-word absolute text-base font-bold text-on-surface whitespace-nowrap pointer-events-none tracking-wide"
          style="left: {word.x}px; top: {word.y}px;"
          class:typed-partial={word.isPartial}
          class:danger={word.isDanger}
        >
          {word.word}
        </div>
      {/each}
    </div>

    <!-- Input row -->
    <div class="flex items-center gap-3 px-6 py-4 bg-surface-container-highest/80 backdrop-blur-sm border-t border-outline-variant">
      <input
        type="text"
        bind:value={typedText}
        bind:this={typingInputEl}
        placeholder="Type here..."
        disabled={!gameRunning || gameOver}
        class="flex-1 bg-white/60 border-2 border-outline-variant rounded-xl px-4 py-3 text-base font-bold tracking-wider text-on-surface placeholder-on-surface/40 focus:border-primary focus:shadow-[0_0_25px_rgba(183,0,26,0.25)] focus:bg-white/80 caret-primary transition disabled:opacity-50 disabled:cursor-not-allowed typing-text"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        on:keydown={(e) => e.key === 'Enter' && processTypedWord()}
      />
      <span class="text-xs text-on-surface-variant/60 whitespace-nowrap">Press Enter ↵</span>
    </div>

    <!-- Start overlay -->
    {#if !gameRunning && !gameOver}
      <div class="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-20">
        <h1 class="text-5xl font-display-hero font-bold tracking-tight bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">⌨️ TypeFall</h1>
        <p class="text-sm text-on-surface-variant max-w-xs text-center leading-relaxed">
          Words are falling! Type them <strong>before</strong> they hit the bottom.<br>
          Miss 5 words and it's game over.
        </p>
        <button
          class="px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider bg-primary text-on-primary shadow-lg shadow-primary/30 hover:-translate-y-1 active:scale-95 transition transform"
          on:click={startGame}
        >
          ▶ &nbsp;Start Game
        </button>
        <p class="text-xs text-on-surface-variant/70">Press <strong>Enter</strong> to submit. Watch your combo grow! 🔥</p>
      </div>
    {/if}

    <!-- Game Over overlay -->
    {#if gameOver}
      <div class="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-20">
        <h2 class="text-3xl font-bold text-on-surface">💥 Game Over</h2>
        <div class="text-6xl font-black text-primary drop-shadow-lg">{score}</div>
        <div class="flex gap-8 text-center">
          <div class="text-on-surface-variant">
            <span class="block text-xs uppercase tracking-wide">Max Combo</span>
            <strong class="text-xl text-on-surface">{maxCombo}</strong>
          </div>
          <div class="text-on-surface-variant">
            <span class="block text-xs uppercase tracking-wide">Level</span>
            <strong class="text-xl text-on-surface">{level}</strong>
          </div>
          <div class="text-on-surface-variant">
            <span class="block text-xs uppercase tracking-wide">Words</span>
            <strong class="text-xl text-on-surface">{wordsCleared}</strong>
          </div>
        </div>
        <button
          class="px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider bg-error text-on-error shadow-lg shadow-error/30 hover:-translate-y-1 active:scale-95 transition transform"
          on:click={restartGame}
        >
          🔄 &nbsp;Play Again
        </button>
      </div>
    {/if}
  </div>
</main>

<style>
  /* Custom particle animation (unchanged) */
  .particle {
    position: absolute;
    border-radius: 50%;
    background: rgba(183, 0, 26, 0.15);
    animation: floatUp linear infinite;
    pointer-events: none;
  }
  @keyframes floatUp {
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-110vh) translateX(40px) scale(0.3); opacity: 0; }
  }

  .falling-word {
    text-shadow: 0 0 12px rgba(183, 0, 26, 0.5), 0 2px 8px rgba(0, 0, 0, 0.6);
    transition: color 0.2s;
  }
  .falling-word.typed-partial {
    color: #ffd875 !important;
    text-shadow: 0 0 20px rgba(255, 216, 117, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6) !important;
  }
  .falling-word.danger {
    animation: shake 0.5s ease-in-out infinite;
    color: #ff9090 !important;
    text-shadow: 0 0 20px rgba(186, 26, 26, 0.9) !important;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }

  .shake-input {
    animation: shakeInput 0.4s ease-out;
    border-color: #ba1a1a !important;
    box-shadow: 0 0 20px rgba(186, 26, 26, 0.5) !important;
  }
  @keyframes shakeInput {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(4px); }
  }

  .danger-glow {
    animation: dangerPulse 2s ease-in-out infinite;
  }
  @keyframes dangerPulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.9; }
  }
</style>