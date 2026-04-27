<!-- ZenTypeReverse.svelte -->
<svelte:head>
  <!-- Load required fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
</svelte:head>

<script>
  import { tick, onMount } from 'svelte';

  // ------------------------------------------------------------
  // Constants
  // ------------------------------------------------------------
  const WORD_LIST = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
    "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
    "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could",
    "them", "see", "other", "than", "then", "now", "look", "only", "come",
    "its", "over", "think", "also", "back", "after", "use", "two", "how",
    "our", "work", "first", "well", "way", "even", "new", "want", "because",
    "any", "these", "give", "day", "most", "us", "is", "are", "computer",
    "system", "code", "software", "screen", "keyboard", "mouse", "program",
    "function", "variable", "data", "internet"
  ];

  // ------------------------------------------------------------
  // State
  // ------------------------------------------------------------
  let chars = [];                // { text, correct, incorrect }
  let charRefs = [];            // DOM spans bound via bind:this
  let words = [];               // grouped words for markup: [{ chars: [{ char, status, globalIndex }] }]
  let currentIndex = -1;
  let selectedWordCount = 50;
  let isPlaying = false;
  let isFinished = false;
  let isResetting = false;      // guard during word‑count changes
  let timerInterval = null;
  let startTime = null;

  let timeElapsed = 0;
  let wpm = 0;
  let accuracy = 100;

  let showResults = false;
  let finalWpm = 0;
  let finalAccuracy = 100;

  let isFocused = true;
  let hiddenInput;

  // ------------------------------------------------------------
  // Word generation
  // ------------------------------------------------------------
  function generateWords(count) {
    const newChars = [];
    for (let i = 0; i < count; i++) {
      const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
      for (let j = 0; j < word.length; j++) {
        newChars.push({ text: word[j], correct: false, incorrect: false });
      }
      if (i < count - 1) {
        newChars.push({ text: ' ', correct: false, incorrect: false });
      }
    }
    return newChars;
  }

  // ------------------------------------------------------------
  // Core game logic
  // ------------------------------------------------------------
  function initGame() {
    isResetting = true;
    clearInterval(timerInterval);
    isPlaying = false;
    isFinished = false;
    timeElapsed = 0;
    startTime = null;
    showResults = false;

    timeElapsed = 0;
    wpm = 0;
    accuracy = 100;

    chars = generateWords(selectedWordCount);
    charRefs = [];                          // will be filled by bind:this
    currentIndex = chars.length - 1;       // start at last character

    if (hiddenInput) hiddenInput.value = '';

    // Wait for DOM to update, then set focus and cursor
    tick().then(() => {
      isResetting = false;
      focusInput();
      updateCursor();
    });
  }

  function startGame() {
    if (isPlaying || isFinished) return;
    isPlaying = true;
    startTime = Date.now();
    timerInterval = setInterval(() => {
      timeElapsed++;
      updateStats();
    }, 1000);
  }

  function updateStats() {
    if (!startTime) return;
    let typedTotal = (chars.length - 1) - currentIndex;
    let correctCount = 0;
    for (let i = chars.length - 1; i > currentIndex; i--) {
      if (chars[i] && chars[i].correct) correctCount++;
    }
    const mins = (Date.now() - startTime) / 60000;
    wpm = mins > 0 ? Math.round((correctCount / 5) / mins) : 0;
    accuracy = typedTotal > 0 ? Math.round((correctCount / typedTotal) * 100) : 100;
  }

  function endGame() {
    clearInterval(timerInterval);
    isPlaying = false;
    isFinished = true;
    updateStats();
    finalWpm = Math.max(0, wpm);
    finalAccuracy = accuracy;
    showResults = true;
  }

  // ------------------------------------------------------------
  // Cursor positioning
  // ------------------------------------------------------------
//   function updateCursor() {
//     if (isFinished || chars.length === 0 || !charRefs.length) return;
//     const cursorEl = document.getElementById('cursor');
//     if (!cursorEl) return;

//     if (currentIndex >= 0 && currentIndex < charRefs.length) {
//       const target = charRefs[currentIndex];
//       if (!target) return;
//       const left = target.offsetLeft + target.offsetWidth;
//       const top = target.offsetTop + 4;
//       cursorEl.style.transform = `translate(${left}px, ${top}px)`;
//     } else if (currentIndex < 0) {
//       // finished – cursor disappears
//       cursorEl.style.opacity = '0';
//     }
//   }
function updateCursor() {
  if (isFinished || chars.length === 0 || !charRefs.length) return;
  const cursorEl = document.getElementById('cursor');
  if (!cursorEl) return;

  // Guard: currentIndex must be within valid bounds
  if (currentIndex < 0 || currentIndex >= charRefs.length) {
    if (currentIndex < 0) cursorEl.style.opacity = '0';
    return;
  }

  const target = charRefs[currentIndex];
  if (!target) return;

  // Wait for layout to be done, then position the cursor
  requestAnimationFrame(() => {
    // Ensure the target element is still in the DOM
    if (!target.isConnected) return;
    const left = target.offsetLeft + target.offsetWidth;
    const top = target.offsetTop + 4;
    cursorEl.style.transform = `translate(${left}px, ${top}px)`;
  });
}

  // ------------------------------------------------------------
  // Input handling
  // ------------------------------------------------------------
  function handleKeydown(e) {
    if (isFinished || currentIndex < 0 || isResetting) return;

    // Start timer on first meaningful keystroke
    if (!isPlaying && e.key.length === 1) startGame();

    if (e.key === 'Backspace') {
      if (currentIndex < chars.length - 1) {
        currentIndex++;
        chars[currentIndex].correct = false;
        chars[currentIndex].incorrect = false;
        updateCursor();
      }
      e.preventDefault();
      return;
    }

    if (e.key.length !== 1 || e.key === 'Tab') return;

    const expected = chars[currentIndex].text;
    if (e.key === expected) {
      chars[currentIndex].correct = true;
      chars[currentIndex].incorrect = false;
    } else {
      chars[currentIndex].correct = false;
      chars[currentIndex].incorrect = true;
    }

    currentIndex--;
    if (currentIndex < 0) {
      endGame();
    } else {
      updateCursor();
    }
    hiddenInput.value = '';
    e.preventDefault();
  }

  function focusInput() {
    if (hiddenInput && !isFinished && !isResetting) {
      hiddenInput.focus();
      isFocused = true;
    }
  }

  function onBlur() {
    if (!isFinished && !isResetting) {
      isFocused = true;
    }
  }

  // ------------------------------------------------------------
  // Word count selector
  // ------------------------------------------------------------
  function setWordCount(count) {
    if (selectedWordCount === count) return;
    selectedWordCount = count;
    initGame();
  }

  // ------------------------------------------------------------
  // Restart
  // ------------------------------------------------------------
  function restart() {
    initGame();
  }

  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------
  onMount(() => {
    initGame();
    window.addEventListener('resize', updateCursor);
    return () => window.removeEventListener('resize', updateCursor);
  });

  // Keep cursor position in sync after DOM updates
  $: if (currentIndex !== undefined && charRefs.length && !isResetting) {
    tick().then(updateCursor);
  }

  // Build words grouping for markup (derived from flat `chars`)
  function buildWordsFromChars(charsArr) {
    const wordsOut = [];
    let currentWord = { chars: [] };
    for (let i = 0; i < charsArr.length; i++) {
      const c = charsArr[i];
      // keep a reference to the original char object so classes update in-place
      currentWord.chars.push({ charObj: c, globalIndex: i, el: null });
      if (c && c.text === ' ') {
        wordsOut.push(currentWord);
        currentWord = { chars: [] };
      }
    }
    if (currentWord.chars.length) wordsOut.push(currentWord);
    return wordsOut;
  }

  $: words = buildWordsFromChars(chars);

  // Derive a flat array of element refs for legacy use (e.g. updateCursor)
  $: charRefs = words.flatMap(w => w.chars.map(c => c.el || null));
</script>

<!-- ==================== MARKUP ==================== -->
<div class="zen-reverse-root w-full min-h-screen bg-background text-on-background font-body overflow-hidden flex flex-col">
  
  <!-- Header -->
  <header class="w-full max-w-5xl mx-auto p-6 flex flex-col items-center mt-4">
    <div class="w-full flex justify-between items-center mb-6">
      <h1 class="text-3xl font-extrabold tracking-tighter text-primary">
        zen<span class="text-on-background">type</span>
        <span class="text-sm font-medium bg-outline/10 px-2 py-1 rounded text-outline align-middle ml-2">
          REVERSE
        </span>
      </h1>

      <div class="flex gap-8 text-tertiary font-semibold text-xl">
        <div class="flex flex-col items-center">
          <span class="text-[12px] text-outline uppercase tracking-widest mb-1">Time</span>
          <span>{timeElapsed}</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-[12px] text-outline uppercase tracking-widest mb-1">WPM</span>
          <span>{Math.max(0, wpm)}</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-[12px] text-outline uppercase tracking-widest mb-1">Accuracy</span>
          <span>{accuracy}%</span>
        </div>
      </div>
    </div>

    <!-- Word count buttons -->
    <div class="flex bg-surface-container px-6 py-2 rounded-full text-sm font-bold text-on-surface-variant gap-6 select-none z-20 shadow-sm border border-outline-variant">
      {#each [5, 10, 20, 50] as count}
        <button
          class="word-btn hover:text-primary transition-colors"
          class:active={selectedWordCount === count}
          on:click={() => setWordCount(count)}
        >
          {count}
        </button>
      {/each}
    </div>
  </header>

  <!-- Main Typing Area -->
  <main class="flex-grow flex items-center justify-center p-6 w-full max-w-5xl mx-auto relative group">
    <!-- Focus overlay (shown when input loses focus) -->
    {#if !isFocused && !isFinished}
      <div
        class="absolute inset-0 z-50 flex items-center justify-center blur-overlay rounded-xl cursor-pointer transition-opacity duration-300 opacity-100"
        on:click={focusInput}
      >
        <p class="text-primary text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-outlined">center_focus_strong</span>
          Click to focus (Type Backwards!)
        </p>
      </div>
    {:else}
      <div class="absolute inset-0 z-50 opacity-0 pointer-events-none"></div>
    {/if}

    <!-- Hidden input to capture keystrokes -->
    <input
      type="text"
      bind:this={hiddenInput}
      id="hidden-input"
      autocomplete="off"
      spellcheck="false"
      class="absolute opacity-0 z-[-999] pointer-events-none"
      on:keydown={handleKeydown}
      on:focus={() => isFocused = true}
      on:blur={onBlur}
    />

    <div id="text-container" class="typing-area-container w-full break-words relative outline-none cursor-text select-none text-left">
      <div id="cursor" class="cursor-blink absolute w-[3px] h-[2.2rem] bg-primary rounded-[4px] z-10"
           style="opacity: {isFinished ? 0 : 1}; transition: transform 0.15s cubic-bezier(0.2,0,0,1), opacity 0.2s ease;">
      </div>
      <!-- <div id="words" class="flex flex-wrap gap-x-3 gap-y-2"> -->
      <div id="words" class="flex flex-wrap gap-x-1 sm:gap-x-3 gap-y-1 sm:gap-y-2">
        {#each words as word}
          <div class="word flex">
            {#each word.chars as ch}
              <span
                bind:this={ch.el}
                class="char relative {ch.charObj && ch.charObj.correct ? 'correct' : ''} {ch.charObj && ch.charObj.incorrect ? 'incorrect' : ''}"
                data-index={ch.globalIndex}
              >
                {ch.charObj ? ch.charObj.text : ''}
              </span>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </main>

  <!-- Restart button -->
  <footer class="w-full pb-12 flex justify-center">
    <button
      id="restart-btn"
      class="group flex items-center justify-center p-4 rounded-full hover:bg-surface-container-high text-outline hover:text-primary transition-all duration-200"
      on:click={restart}
    >
      <span class="material-symbols-outlined text-3xl group-hover:-rotate-90 transition-transform duration-300">refresh</span>
    </button>
  </footer>

  <!-- Results modal -->
  {#if showResults}
    <div class="fixed inset-0 z-[100] flex items-center justify-center blur-overlay opacity-100 transition-opacity duration-300">
      <div class="bg-surface border border-outline-variant p-10 rounded-2xl shadow-2xl transform scale-100 transition-transform duration-300 flex flex-col items-center gap-6 max-w-md w-full text-center">
        <h2 class="text-3xl font-extrabold text-primary mb-2">Backwards Master!</h2>
        <div class="grid grid-cols-2 gap-8 w-full">
          <div class="bg-surface-container-low p-5 rounded-xl border border-outline-variant">
            <p class="text-[12px] text-outline uppercase tracking-wider mb-1">Speed</p>
            <p class="text-4xl font-bold text-tertiary">
              {finalWpm} <span class="text-lg font-medium text-outline">WPM</span>
            </p>
          </div>
          <div class="bg-surface-container-low p-5 rounded-xl border border-outline-variant">
            <p class="text-[12px] text-outline uppercase tracking-wider mb-1">Accuracy</p>
            <p class="text-4xl font-bold text-success-green">{finalAccuracy}%</p>
          </div>
        </div>
        <button
          class="mt-4 px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-primary-container transition-all w-full shadow-lg flex items-center justify-center gap-2"
          on:click={restart}
        >
          <span class="material-symbols-outlined">replay</span>
          Try Again
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Scoped component styles – no leaked global selectors */
  .zen-reverse-root {
    background-color: #fff8f7;
    color: #2a1615;
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .typing-area-container {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.75rem;
    line-height: 1.6;
    position: relative;
  }

  .char {
    color: #936e6b;
    transition: color 0.1s ease;
    border-radius: 2px;
  }
  .char.correct {
    color: #2a1615;
  }
  .char.incorrect {
    color: #ba1a1a;
    background-color: #ffdad6;
  }

  .blur-overlay {
    backdrop-filter: blur(8px);
    background-color: rgba(255, 248, 247, 0.8);
  }

  .word-btn.active {
    color: #b7001a;
    font-weight: 800;
  }

  .cursor-blink {
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* Ensure the hidden input doesn't interfere */
  #hidden-input {
    position: absolute;
    opacity: 0;
    z-index: -999;
    pointer-events: none;
  }
</style>