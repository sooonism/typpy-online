<script>
	import { onMount, afterUpdate, tick } from 'svelte';

	// --- Constants ---
	const QUOTES = [
		"Be the change that you wish to see in the world.",
		"Stay hungry stay foolish.",
		"I think therefore I am.",
		"The only way to do great work is to love what you do.",
		"Life is what happens when you are making other plans.",
		"Spread love everywhere you go.",
		"Believe you can and you are halfway there.",
		"Whatever you are be a good one.",
		"Knowledge is power.",
		"Simple is better than complex."
	];

	// --- State ---
	let chars = [];
	let currentIndex = 0;
	let isPlaying = false;
	let isFinished = false;
	let score = 0;
	let wpm = 0;
	let accuracy = 100;
	let startTime = null;
	let scoreClass = '';
	let floats = [];
	let cursorBlink = true;
	let isInputFocused = false;

	// Refs
	let wordsContainer;
	let charRefs = [];
	let hiddenInput;
	let scoreContainer;
	let cursorStyle = '';

	// --- Derived state for the focus overlay ---
	$: showFocusOverlay = !isInputFocused && !isFinished;

	// --- Cursor logic ---
	afterUpdate(() => {
		if (isFinished) return;
		if (charRefs.length === 0) return;
		let targetEl = charRefs[currentIndex] || charRefs[charRefs.length - 1];
		if (!targetEl || !wordsContainer) return;

		const containerRect = wordsContainer.getBoundingClientRect();
		const charRect = targetEl.getBoundingClientRect();
		let x, y;

		if (currentIndex < chars.length) {
			x = charRect.left - containerRect.left;
			y = charRect.top - containerRect.top + 4;
		} else {
			// Past last character – place after last char
			const lastCharEl = charRefs[charRefs.length - 1];
			const lastRect = lastCharEl.getBoundingClientRect();
			x = lastRect.right - containerRect.left;
			y = lastRect.top - containerRect.top + 4;
		}
		cursorStyle = `transform: translate(${x}px, ${y}px)`;
	});

	// --- Game functions ---
	function initGame() {
		isPlaying = false;
		isFinished = false;
		currentIndex = 0;
		score = 0;
		wpm = 0;
		accuracy = 100;
		startTime = null;
		chars = [];
		charRefs = [];
		floats = [];
		cursorBlink = true;
		scoreClass = '';
		hiddenInput && (hiddenInput.value = '');
		updateStats();

		let fullQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
		let wordsArray = fullQuote.split(' ').slice(0, 20);

		let newChars = [];
		wordsArray.forEach((word, wordIdx) => {
			[...word].forEach(char => {
				newChars.push({
					char,
					isSpace: false,
					class: 'char'
				});
			});
			if (wordIdx < wordsArray.length - 1) {
				newChars.push({
					char: ' ',
					isSpace: true,
					class: 'char space-hidden'
				});
			}
		});
		chars = newChars;

		// Wait for the DOM to render, then focus
		tick().then(() => {
			focusInput();
		});
	}

	function handleKeydown(e) {
		if (isFinished) return;
		if (e.key === 'Backspace') {
			if (currentIndex > 0) {
				currentIndex--;
				const item = chars[currentIndex];
				if (item.isSpace) {
					item.class = 'char space-hidden';
				} else {
					item.class = 'char';
				}
				chars = chars; // trigger reactivity
			}
			return;
		}

		if (e.key.length !== 1) return;

		// Start timer on first valid keypress
		if (!isPlaying) {
			isPlaying = true;
			startTime = Date.now();
			cursorBlink = false;
		}

		const target = chars[currentIndex];
		const typed = e.key;

		if (target.isSpace) {
			if (typed === ' ') {
				target.class = 'char correct space-fixed';
				score += 50;
				addFloat(50);
			} else {
				target.class = 'char incorrect';
				score = Math.max(0, score - 50);
				addFloat(-50);
			}
		} else {
			if (typed === target.char) {
				target.class = 'char correct';
				score += 10;
			} else {
				target.class = 'char incorrect';
			}
		}

		currentIndex++;
		chars = chars; // force reactivity for updated classes
		updateStats();
		hiddenInput.value = '';

		if (currentIndex >= chars.length) {
			endGame();
		}
	}

	function endGame() {
		isFinished = true;
		isPlaying = false;
		cursorBlink = false;
		// Stats are already up to date
	}

	function updateStats() {
		if (!startTime) {
			wpm = 0;
			accuracy = 100;
			return;
		}
		const timeElapsed = (Date.now() - startTime) / 60000;
		const correctChars = chars.filter((c, i) => i < currentIndex && c.class.includes('correct')).length;
		const calcWpm = timeElapsed > 0 ? Math.round((correctChars / 5) / timeElapsed) : 0;
		const calcAccuracy = currentIndex > 0 ? Math.round((correctChars / currentIndex) * 100) : 100;
		wpm = calcWpm;
		accuracy = calcAccuracy;
	}

	function addFloat(points) {
		const id = Date.now() + Math.random();
		const text = points > 0 ? `+${points}` : points;
		const type = points > 0 ? 'positive' : 'negative';
		floats = [...floats, { id, text, type }];
		setTimeout(() => {
			floats = floats.filter(f => f.id !== id);
		}, 800);

		// Animate the score counter
		const animClass = points > 0 ? 'score-pop' : 'score-shake';
		scoreClass = animClass;
		setTimeout(() => scoreClass = '', 300);
	}

	function focusInput() {
		hiddenInput && hiddenInput.focus();
	}

	// --- Lifecycle ---
	onMount(() => {
		initGame();
	});

	// --- Accessibility: clicking anywhere re‑focuses input ---
	function handleOutsideClick(e) {
		if (!e.target.closest('button')) focusInput();
	}
</script>

<svelte:head>
	<!-- Fonts -->
	<link href="https://fonts.googleapis.com" rel="preconnect"/>
	<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
	<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
	<!-- Material Symbols -->
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
</svelte:head>

<!-- Full-page wrapper -->
<div class="flex flex-col min-h-screen bg-background text-on-background font-body antialiased selection:bg-primary selection:text-white" style="overflow: hidden;">
	<header class="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col items-center mt-2 sm:mt-4">
		<div class="w-full flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 px-2 sm:px-4 gap-4 sm:gap-0">
			<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tighter text-primary">type<span class="text-on-background">space</span></h1>
			
			<div class="flex gap-4 sm:gap-8 text-tertiary font-semibold text-lg sm:text-xl">
				<div class="flex flex-col items-center relative" bind:this={scoreContainer}>
					<span class="text-[10px] text-outline uppercase tracking-widest mb-1">Score</span>
					<span class="transition-transform duration-200 inline-block {scoreClass}">{score}</span>
					<!-- Floating points elements -->
					{#each floats as f (f.id)}
						<div class="floating-points {f.type === 'positive' ? 'points-positive' : 'points-negative'}">{f.text}</div>
					{/each}
				</div>
				<div class="flex flex-col items-center">
					<span class="text-[10px] text-outline uppercase tracking-widest mb-1">WPM</span>
					<span>{wpm}</span>
				</div>
				<div class="flex flex-col items-center">
					<span class="text-[10px] text-outline uppercase tracking-widest mb-1">Accuracy</span>
					<span>{accuracy}%</span>
				</div>
			</div>
		</div>

		<div class="mb-4 flex bg-surface-container px-6 py-2 rounded-full text-sm font-bold text-on-surface-variant gap-4 shadow-sm border border-outline-variant text-center">
			<span class="flex items-center gap-1"> Words are joined! Press Space at word boundaries for +50 pts.</span>
		</div>
	</header>

	<main class="flex-grow flex items-center justify-center p-2 sm:p-6 w-full max-w-5xl mx-auto relative group" on:click={handleOutsideClick}>
		<!-- Focus overlay -->
		<div class="absolute inset-0 z-50 flex items-center justify-center blur-overlay rounded-xl cursor-pointer transition-opacity duration-300 {showFocusOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}" on:click|stopPropagation={focusInput}>
			<p class="text-primary text-xl font-bold flex items-center gap-2">
				<span class="material-symbols-outlined">center_focus_strong</span>
				Click to focus
			</p>
		</div>

		<!-- Hidden input that captures keystrokes -->
		<input 
			type="text" 
			bind:this={hiddenInput}
			autocomplete="off" 
			spellcheck="false" 
			class="absolute opacity-0 z-[-999] pointer-events-none"
			on:keydown={handleKeydown}
			on:focus={() => isInputFocused = true}
			on:blur={() => isInputFocused = false}
		/>

		<!-- Typing area -->
		<div class="typing-area-container w-full max-w-full sm:max-w-3xl break-words relative outline-none cursor-text select-none text-left font-mono text-[1.1rem] sm:text-[1.75rem] leading-[1.6] px-1 sm:px-0" bind:this={wordsContainer}>
			<div id="cursor" style={cursorStyle} class="absolute w-[3px] h-[2.2rem] bg-primary rounded z-10 {cursorBlink ? 'cursor-blink' : ''}" class:opacity-0={isFinished}></div>
			<div id="words" class="flex flex-wrap">
				<!-- Render characters with Svelte -->
				{#each chars as c, i (i)}
					<span class={c.class} bind:this={charRefs[i]}>{c.char}</span>
				{/each}
			</div>
		</div>
	</main>

	<footer class="w-full max-w-5xl mx-auto pb-8 sm:pb-12 flex justify-center">
		<button 
			class="group flex items-center justify-center p-3 sm:p-4 rounded-full hover:bg-surface-container-high text-outline hover:text-primary transition-all duration-200"
			on:click={initGame}
		>
			<span class="material-symbols-outlined text-3xl group-hover:-rotate-90 transition-transform duration-300">refresh</span>
		</button>
	</footer>

	<!-- Results modal -->
	<div role="status" aria-hidden={!isFinished} class="fixed inset-0 z-[100] flex items-center justify-center blur-overlay transition-opacity duration-300 {isFinished ? 'opacity-100' : 'opacity-0 pointer-events-none'}">
		<div class="bg-surface border border-outline-variant p-4 sm:p-10 rounded-2xl shadow-2xl transform scale-95 transition-transform duration-300 flex flex-col items-center gap-4 sm:gap-6 max-w-md w-full">
			<h2 class="text-3xl font-extrabold text-primary mb-2">Test Complete</h2>
			<div class="grid grid-cols-2 gap-4 sm:gap-8 w-full text-center">
				<div class="bg-surface-container p-4 rounded-xl">
					<p class="text-[10px] text-outline uppercase tracking-wider mb-1">Final Score</p>
					<p class="text-3xl font-bold text-primary">{score}</p>
				</div>
				<div class="bg-surface-container p-4 rounded-xl">
					<p class="text-[10px] text-outline uppercase tracking-wider mb-1">Speed</p>
					<p class="text-3xl font-bold text-tertiary">{wpm} <span class="text-sm">WPM</span></p>
				</div>
			</div>
			<button class="mt-4 sm:mt-6 px-6 sm:px-12 py-3 sm:py-5 bg-primary text-white text-xl sm:text-2xl font-extrabold rounded-2xl border-4 border-primary shadow-2xl hover:bg-primary-container hover:text-primary transition-all w-full flex items-center justify-center gap-2 sm:gap-3" on:click={initGame}>Try Again</button>
		</div>
	</div>
</div>

<style>
	/* Material symbols base styling */
	.material-symbols-outlined {
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}

	/* Typing area */
	.typing-area-container {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.1rem;
		line-height: 1.6;
		position: relative;
		min-height: 3em; /* ensure height even when empty */
	}

	@media (min-width: 640px) {
		.typing-area-container {
			font-size: 1.75rem;
		}
	}

	.char {
		color: #936e6b;
		transition: all 0.15s ease;
		display: inline-block;
		white-space: pre;
	}

	.char.correct { color: #2a1615; }
	.char.incorrect { color: #ba1a1a; background-color: #ffdad6; }
	
	/* Spacing styling */
	.char.space-fixed {
		color: #103c25 !important;
		background-color: #e6f4ea;
		border-radius: 4px;
		font-weight: bold;
		width: auto !important;
	}
	
	.char.space-hidden {
		color: transparent;
		background-color: transparent;
		width: 0;
		overflow: hidden;
	}

	/* Blur overlay */
	.blur-overlay { 
		backdrop-filter: blur(8px); 
		background-color: rgba(255, 248, 247, 0.8); 
	}

	/* Cursor animation */
	.cursor-blink { animation: blink 1s infinite; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

	/* Score animations */
	.score-pop {
		animation: pop 0.3s cubic-bezier(0.25, 1, 0.5, 1);
	}
	.score-shake {
		animation: shake 0.3s ease-in-out;
	}

	@keyframes pop {
		0% { transform: scale(1); }
		50% { transform: scale(1.3); color: #103c25; }
		100% { transform: scale(1); }
	}
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px); color: #b7001a; }
		75% { transform: translateX(5px); color: #b7001a; }
	}

	/* Floating points */
	.floating-points {
		position: absolute;
		font-weight: bold;
		pointer-events: none;
		animation: floatUp 0.8s ease-out forwards;
		font-size: 1rem;
		z-index: 50;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.points-positive { color: #103c25; }
	.points-negative { color: #b7001a; }

	@keyframes floatUp {
		0% { transform: translateY(0) translateX(-50%); opacity: 1; }
		100% { transform: translateY(-40px) translateX(-50%); opacity: 0; }
	}
</style>