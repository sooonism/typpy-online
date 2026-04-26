<!-- ZenType.svelte -->
<script>
  import { onMount, tick } from 'svelte';

  // ─── Word bank ────────────────────────────────────
  const WORD_LIST = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "their", "what", "so", "up", "out", "if", "about", "who", "get",
    "which", "go", "me", "when", "make", "can", "like", "time", "no",
    "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "because", "any", "these",
    "give", "day", "most", "us", "is", "are", "was", "computer",
    "system", "code", "software", "screen", "keyboard", "mouse",
    "program", "function", "variable", "data", "internet"
  ];

  // ─── Reactive state (Svelte 5 runes) ─────────────
  let words = $state([]);
  let currentIndex = $state(0);
  let isPlaying = $state(false);
  let isFinished = $state(false);
  let timeElapsed = $state(0);
  let selectedWordCount = $state(50);
  let startTime = $state(null);
  let wpm = $state(0);
  let accuracy = $state(100);
  let showResults = $state(false);
  let finalWpm = $state(0);
  let finalAccuracy = $state(100);
  let showFocusOverlay = $state(true);
  let cursorVisible = $state(true);

  // DOM references
  let hiddenInputEl = $state(null);
  let cursorEl = $state(null);
  let textContainerEl = $state(null);

  let totalChars = $derived(words.reduce((sum, w) => sum + w.chars.length, 0));

  // ─── Initialise / reset game ────────────────────
  async function initGame() {
    isPlaying = false;
    isFinished = false;
    currentIndex = 0;
    timeElapsed = 0;
    startTime = null;
    wpm = 0;
    accuracy = 100;
    showResults = false;
    cursorVisible = true;

    let globalIdx = 0;
    const newWords = [];

    for (let i = 0; i < selectedWordCount; i++) {
      const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
      const wordChars = [];

      for (let j = 0; j < randomWord.length; j++) {
        wordChars.push({
          char: randomWord[j],
          status: 'untyped',
          globalIndex: globalIdx++
        });
      }

      if (i < selectedWordCount - 1) {
        wordChars.push({
          char: ' ',
          status: 'untyped',
          globalIndex: globalIdx++
        });
      }

      newWords.push({ chars: wordChars });
    }

    words = newWords;

    await tick();
    focusInput();
    updateCursorPosition();
  }

  // ─── Timer effect ────────────────────────────────
  $effect(() => {
    if (isPlaying && !isFinished) {
      const interval = setInterval(() => {
        timeElapsed++;
        updateStats();
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  // ─── Cursor positioning effect ──────────────────
  $effect(() => {
    void currentIndex;
    void words;
    void isFinished;

    if (isFinished) {
      if (cursorEl) cursorEl.style.opacity = '0';
      return;
    }

    tick().then(() => updateCursorPosition());
  });

  function updateCursorPosition() {
    if (!cursorEl || !textContainerEl) return;

    const allChars = getAllCharElements();
    
    if (currentIndex < allChars.length) {
      const target = allChars[currentIndex];
      const leftOffset = target.offsetLeft;
      const topOffset = target.offsetTop;
      cursorEl.style.transform = `translate(${leftOffset - 1}px, ${topOffset + 4}px)`;
      cursorEl.style.opacity = cursorVisible ? '1' : '0';
    } else if (allChars.length > 0) {
      const lastTarget = allChars[allChars.length - 1];
      cursorEl.style.transform = `translate(${lastTarget.offsetLeft + lastTarget.offsetWidth}px, ${lastTarget.offsetTop + 4}px)`;
      cursorEl.style.opacity = cursorVisible ? '1' : '0';
      endGame();
    }
  }

  function getAllCharElements() {
    if (!textContainerEl) return [];
    return Array.from(textContainerEl.querySelectorAll('[data-index]'));
  }

  // ─── Stats calculator ────────────────────────────
  function updateStats() {
    let correctCount = 0;
    let typedCount = 0;

    for (const word of words) {
      for (const ch of word.chars) {
        if (ch.globalIndex < currentIndex) {
          typedCount++;
          if (ch.status === 'correct') correctCount++;
        }
      }
    }

    const timeElapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0;
    let calculatedWpm = 0;
    if (timeElapsedMinutes > 0) {
      calculatedWpm = Math.round((correctCount / 5) / timeElapsedMinutes);
    }

    let calculatedAccuracy = 100;
    if (typedCount > 0) {
      calculatedAccuracy = Math.round((correctCount / typedCount) * 100);
    }

    if (calculatedWpm < 0 || !isFinite(calculatedWpm)) calculatedWpm = 0;

    wpm = calculatedWpm;
    accuracy = calculatedAccuracy;
    return { wpm: calculatedWpm, accuracy: calculatedAccuracy };
  }

  // ─── Game flow ────────────────────────────────────
  function startGame() {
    if (isPlaying || isFinished) return;
    isPlaying = true;
    startTime = Date.now();
    cursorVisible = true;
  }

  function endGame() {
    if (isFinished) return;
    isPlaying = false;
    isFinished = true;
    cursorVisible = false;
    showResults = true;

    const stats = updateStats();
    finalWpm = stats.wpm;
    finalAccuracy = stats.accuracy;

    if (hiddenInputEl) hiddenInputEl.blur();
    if (cursorEl) cursorEl.style.opacity = '0';
  }

  function focusInput() {
    if (isFinished) return;
    showFocusOverlay = false;
    cursorVisible = true;
    if (hiddenInputEl) hiddenInputEl.focus();
  }

  // ─── Keyboard handler ────────────────────────────
  function handleKeydown(e) {
    if (isFinished) return;

    // Start game on first character
    if (!isPlaying && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      startGame();
    }

    // Prevent default for space/tab
    if (e.key === ' ' || e.key === 'Tab') {
      e.preventDefault();
      if (e.key === 'Tab') return;
    }

    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
        currentIndex--;
        for (const word of words) {
          for (const ch of word.chars) {
            if (ch.globalIndex === currentIndex) {
              ch.status = 'untyped';
              break;
            }
          }
        }
      }
      return;
    }

    // Only process printable characters here for desktop
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    // On desktop, process the key
    processInputChar(e.key);
  }

  function processInputChar(inputChar) {
    let targetChar = null;
    for (const word of words) {
      for (const ch of word.chars) {
        if (ch.globalIndex === currentIndex) {
          targetChar = ch;
          break;
        }
      }
      if (targetChar) break;
    }
    if (!targetChar) return;

    if (inputChar === targetChar.char) {
      targetChar.status = 'correct';
    } else {
      targetChar.status = 'incorrect';
    }
    currentIndex++;

    if (hiddenInputEl) hiddenInputEl.value = '';

    if (currentIndex >= totalChars) {
      endGame();
    }
  }

  // Handle input event for mobile soft keyboard
  function handleInput(e) {
    if (isFinished) return;
    const value = e.target.value;
    if (!isPlaying && value.length > 0) {
      startGame();
    }
    if (value.length > 0) {
      // Only process the last character entered
      const lastChar = value[value.length - 1];
      processInputChar(lastChar);
      // Clear input value after processing
      e.target.value = '';
    }
  }

  function handleInputBlur() {
    if (!isFinished) {
      showFocusOverlay = true;
      cursorVisible = false;
    }
  }

  function handleInputFocus() {
    if (!isFinished) {
      showFocusOverlay = false;
      cursorVisible = true;
    }
  }

  function handleWindowClick(e) {
    const ignoreSelectors = ['[data-word-btn]', '#restart-btn', '#modal-restart-btn'];
    if (ignoreSelectors.some(sel => e.target.closest(sel))) return;
    focusInput();
  }

  function handleWindowResize() {
    if (isPlaying || currentIndex > 0) {
      updateCursorPosition();
    }
  }

  onMount(() => {
    initGame();
  });
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com" rel="preconnect" />
  <link crossorigin href="https://fonts.gstatic.com" rel="preconnect" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
</svelte:head>

<svelte:window onclick={handleWindowClick} onresize={handleWindowResize} />

<div class="flex flex-col min-h-screen bg-background text-on-background font-body antialiased selection:bg-primary selection:text-white"
  style="overflow: hidden;">

  <!-- Header / Stats – full width -->
  <header class="w-full p-4 sm:p-6 flex flex-col items-center mt-2 sm:mt-4">
    <div class="w-full flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 px-2 sm:px-4 gap-4 sm:gap-0">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tighter text-primary">
        zen<span class="text-on-background">type</span>
      </h1>

      <div class="flex gap-4 sm:gap-8 text-tertiary font-semibold text-lg sm:text-xl">
        <div class="flex flex-col items-center">
          <span class="text-caption text-outline uppercase tracking-widest mb-1">Time</span>
          <span>{timeElapsed}</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-caption text-outline uppercase tracking-widest mb-1">WPM</span>
          <span>{wpm}</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-caption text-outline uppercase tracking-widest mb-1">Accuracy</span>
          <span>{accuracy}%</span>
        </div>
      </div>
    </div>

    <!-- Word Count Selector -->
    <div class="flex bg-surface-container px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold text-on-surface-variant gap-4 sm:gap-6 transition-colors select-none z-20 shadow-sm border border-outline-variant">
      {#each [5, 10, 20, 50] as count}
        <button
          data-word-btn
          class="word-btn transition-colors {selectedWordCount === count ? 'text-primary active-word-btn' : 'hover:text-primary'}"
          onclick={(e) => {
            e.stopPropagation();
            selectedWordCount = count;
            initGame();
          }}
        >
          {count}
        </button>
      {/each}
    </div>
  </header>

  <!-- Main Typing Area – truly edge to edge -->
  <main class="flex-grow flex items-center justify-center p-2 sm:p-6 w-full relative group">
    
    <div
      class="absolute inset-0 z-50 flex items-center justify-center blur-overlay rounded-xl cursor-pointer transition-opacity duration-300"
      class:opacity-0={!showFocusOverlay}
      class:pointer-events-none={!showFocusOverlay}
      class:opacity-100={showFocusOverlay}
      class:pointer-events-auto={showFocusOverlay}
      role="button"
      tabindex="0"
      onclick={focusInput}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusInput(); } }}
      aria-label="Click to focus typing area"
    >
      <p class="text-primary text-xl font-bold flex items-center gap-2">
        <span class="material-symbols-outlined">center_focus_strong</span>
        Click to focus
      </p>
    </div>

    <!-- Hidden input -->
    <input
      type="text"
      bind:this={hiddenInputEl}
      onkeydown={handleKeydown}
      oninput={handleInput}
      onblur={handleInputBlur}
      onfocus={handleInputFocus}
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      class="hidden-input-fix"
      style="width:1px;height:1px;opacity:0.01;z-index:10;position:absolute;left:-9999px;"
    />

    <!-- Typing area -->
      <div
        bind:this={textContainerEl}
        class="typing-area-container w-full max-w-full sm:max-w-3xl break-words relative outline-none cursor-text select-none text-left font-mono text-[1.1rem] sm:text-[1.75rem] leading-[1.6] px-1 sm:px-0"
        style="min-width:0; min-width: 800px;"
    >
      <div
        bind:this={cursorEl}
        class="absolute z-10 transition-transform duration-100 ease-out"
        class:cursor-blink={!isPlaying && !isFinished}
        style="width: 3px; height: 2.2rem; background-color: #b7001a; border-radius: 4px; top: 0; left: 0; opacity: {cursorVisible ? '1' : '0'};"
      ></div>

      <div id="words" class="flex flex-wrap gap-x-1 sm:gap-x-3 gap-y-1 sm:gap-y-2">
        {#each words as word}
          <div class="word flex">
            {#each word.chars as charObj}
              <span
                class="char relative {charObj.status === 'correct' ? 'correct' : ''} {charObj.status === 'incorrect' ? 'incorrect' : ''}"
                data-index={charObj.globalIndex}
              >
                {charObj.char}
              </span>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </main>

  <footer class="w-full pb-8 sm:pb-12 flex justify-center">
    <button
      id="restart-btn"
      class="group flex items-center justify-center p-3 sm:p-4 rounded-full hover:bg-surface-container-high text-outline hover:text-primary transition-all duration-200 outline-none focus:ring-2 focus:ring-primary focus:text-primary"
      onclick={initGame}
    >
      <span class="material-symbols-outlined text-3xl group-hover:-rotate-90 transition-transform duration-300">
        refresh
      </span>
    </button>
  </footer>

  <div
    class="fixed inset-0 z-[100] flex items-center justify-center blur-overlay transition-opacity duration-300"
    class:opacity-0={!showResults}
    class:pointer-events-none={!showResults}
  >
    <div
      class="bg-surface border border-outline-variant p-4 sm:p-10 rounded-2xl shadow-2xl transition-transform duration-300 flex flex-col items-center gap-4 sm:gap-6 max-w-md w-full"
      class:scale-95={!showResults}
      class:scale-100={showResults}
    >
      <h2 class="text-3xl font-extrabold text-primary mb-2">Test Complete</h2>

      <div class="grid grid-cols-2 gap-4 sm:gap-8 w-full text-center">
        <div class="bg-surface-container-low p-5 rounded-xl border border-outline-variant">
          <p class="text-caption text-outline uppercase tracking-wider mb-1">Speed</p>
          <p class="text-4xl font-bold text-tertiary">
            {finalWpm} <span class="text-lg font-medium text-outline">WPM</span>
          </p>
        </div>
        <div class="bg-surface-container-low p-5 rounded-xl border border-outline-variant">
          <p class="text-caption text-outline uppercase tracking-wider mb-1">Accuracy</p>
          <p class="text-4xl font-bold text-success-green">
            {finalAccuracy}<span class="text-lg font-medium text-outline">%</span>
          </p>
        </div>
      </div>

      <button
        id="modal-restart-btn"
        class="mt-4 sm:mt-6 px-6 sm:px-12 py-3 sm:py-5 bg-primary text-white text-xl sm:text-2xl font-extrabold rounded-2xl border-4 border-primary shadow-2xl hover:bg-primary-container hover:text-primary focus:bg-white focus:text-primary focus:ring-4 focus:ring-primary/70 transition-all w-full flex items-center justify-center gap-2 sm:gap-3 outline-none z-[101]"
        style="box-shadow: 0 8px 32px 0 rgba(183,0,26,0.25), 0 1.5px 0 0 #fff; letter-spacing: 0.04em;"
        onclick={initGame}
      >
        <span class="material-symbols-outlined text-3xl">replay</span>
        Try Again
      </button>
    </div>
  </div>
</div>

<style>
  @media (max-width: 640px) {
    .typing-area-container {
      font-size: 1.1rem !important;
      padding-left: 0.25rem;
      padding-right: 0.25rem;
      min-width: 0 !important;
      max-width: 100vw !important;
      word-break: break-word;
    }
    .char {
      padding: 0 1px;
    }
    .blur-overlay {
      font-size: 1rem;
    }
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

  .cursor-blink {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .blur-overlay {
    backdrop-filter: blur(8px);
    background-color: rgba(255, 248, 247, 0.85);
  }

  #modal-restart-btn {
    box-shadow: 0 8px 32px 0 rgba(183,0,26,0.25), 0 1.5px 0 0 #fff;
    border-width: 4px;
    border-color: #b7001a;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    z-index: 101;
  }
  #modal-restart-btn:focus {
    background: #fff;
    color: #b7001a;
    outline: none;
    border-color: #b7001a;
  }
  #modal-restart-btn:hover {
    background: #fff0ef;
    color: #b7001a;
    border-color: #b7001a;
  }
</style>