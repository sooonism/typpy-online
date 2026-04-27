<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<script>
	import { onMount, onDestroy, afterUpdate, tick } from 'svelte';

	const PANGRAMS = [
		'Quick nymph bugs vex fjord waltz.',
		'Waltz, bad nymph, for quick jigs vex.',
		'Sphinx of black quartz, judge my vow.',
		'How vexingly quick daft zebras jump!',
		'The five boxing wizards jump quickly.',
		'Pack my box with five dozen liquor jugs.',
		'The quick brown fox jumps over the lazy dog.'
	];

	const GAME_DURATION = 60;
	const PTS_PER_CHAR = 10;
	const PTS_PER_DIAMOND = 500;

	let currentIndex = 0;
	let isPlaying = false;
	let isFinished = false;
	let timeLeft = GAME_DURATION;
	let timerInterval = null;

	let diamondsCollected = 0;
	let typingScore = 0;
	let currentTotalScore = 0;
	let diamondIndex = -1;

	let cursorLeft = 0;
	let cursorTop = 0;
	let rocketTransform = 'scaleX(-1) translate(50%, 20px)';
	let audioCtx = null;

	function initAudio() {
		if (!audioCtx) {
			audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		}
		if (audioCtx.state === 'suspended') {
			audioCtx.resume().catch(() => {});
		}
	}

	function playChimp() {
		if (!audioCtx) return;
		try {
			const now = audioCtx.currentTime;

			// Short noise burst (grunt)
			const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.18, audioCtx.sampleRate);
			const data = noiseBuf.getChannelData(0);
			for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
			const noiseSrc = audioCtx.createBufferSource();
			noiseSrc.buffer = noiseBuf;
			const bp = audioCtx.createBiquadFilter();
			bp.type = 'bandpass';
			bp.frequency.setValueAtTime(900, now);
			bp.Q.setValueAtTime(0.8, now);
			const ng = audioCtx.createGain();
			ng.gain.setValueAtTime(0.18, now);
			ng.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
			noiseSrc.connect(bp);
			bp.connect(ng);
			ng.connect(audioCtx.destination);
			noiseSrc.start(now);
			noiseSrc.stop(now + 0.18);

			// Short oscillator chirp (call)
			const osc = audioCtx.createOscillator();
			const og = audioCtx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(1200, now);
			osc.frequency.exponentialRampToValueAtTime(350, now + 0.18);
			og.gain.setValueAtTime(0.03, now);
			og.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
			osc.connect(og);
			og.connect(audioCtx.destination);
			osc.start(now);
			osc.stop(now + 0.18);
		} catch (e) {
			// fail silently
		}
	}
	let focusLost = true;
	let showResults = false;

	// words will be an array of word objects:
	// [{ chars: [ { globalIndex, el, charObj: { text, correct, incorrect, diamond } } ] }]
	let words = [];
	let hiddenInput;

	function generateText() {
		const text = PANGRAMS[Math.floor(Math.random() * PANGRAMS.length)];
		const splitWords = text.split(' ');
		let gi = 0;
		const nested = splitWords.map((w) => {
			const chars = [];
			for (let c of w) {
				chars.push({
					globalIndex: gi++,
					el: null,
					charObj: { text: c, correct: false, incorrect: false, diamond: false }
				});
			}
			return { chars };
		});
		// insert space char objects between words so spaces are both visible and typable
		for (let i = 0; i < nested.length - 1; i++) {
			nested[i].chars.push({ globalIndex: gi++, el: null, charObj: { text: ' ', correct: false, incorrect: false, diamond: false } });
		}
		words = nested;
		currentIndex = 0;
		diamondIndex = -1;
	}

	function getCharByGlobalIndex(index) {
		for (let wi = 0; wi < words.length; wi++) {
			const chars = words[wi].chars;
			for (let ci = 0; ci < chars.length; ci++) {
				if (chars[ci].globalIndex === index) return { ch: chars[ci], wi, ci };
			}
		}
		return null;
	}

	function spawnDiamond() {
		if (isFinished) return;
		// Helper: flatten chars with their global indices
		const flat = [];
		words.forEach((w, wi) => {
			w.chars.forEach((ch, ci) => flat.push({ ch, wi, ci, gi: ch.globalIndex }));
		});

		// Clear previous diamond if any
		if (diamondIndex !== -1) {
			const prev = getCharByGlobalIndex(diamondIndex);
			if (prev) {
				prev.ch.charObj.diamond = false;
				words = words;
			}
		} else {
			// Defensive: clear any stray diamonds
			for (const item of flat) {
				if (item.ch.charObj && item.ch.charObj.diamond) item.ch.charObj.diamond = false;
			}
			words = words;
		}

		const valid = flat.filter((f) => /[a-zA-Z]/.test(f.ch.charObj.text) && f.gi !== currentIndex).map((f) => f.gi);
		if (valid.length > 0) {
			const idx = valid[Math.floor(Math.random() * valid.length)];
			const entry = getCharByGlobalIndex(idx);
			if (entry) {
				entry.ch.charObj.diamond = true;
				words = words;
				diamondIndex = idx;
			}
		}
	}

	function collectDiamond() {
		diamondsCollected++;
		currentTotalScore += PTS_PER_DIAMOND;
		// remove diamond indicator on collected char
		const entry = getCharByGlobalIndex(diamondIndex);
		if (entry && entry.ch.charObj) {
			entry.ch.charObj.diamond = false;
		}
		diamondIndex = -1;
		initAudio();
		playChimp();
		spawnDiamond();
	}

	function endGame() {
		isFinished = true;
		isPlaying = false;
		clearInterval(timerInterval);
		// rocketTransform = 'scale(1.5) rotate(0deg)';
		showResults = true;
	}

	function startGame() {
		if (isPlaying || isFinished) return;
		isPlaying = true;
		const tickRate = 100;
		timerInterval = setInterval(() => {
			timeLeft -= tickRate / 1000;
			if (timeLeft <= 0) {
				timeLeft = 0;
				endGame();
			}
		}, tickRate);
	}

	function initGame() {
		clearInterval(timerInterval);
		isPlaying = false;
		isFinished = false;
		timeLeft = GAME_DURATION;
		diamondsCollected = 0;
		typingScore = 0;
		currentTotalScore = 0;
		showResults = false;
		focusLost = true;
		generateText();
		spawnDiamond();
		// Ensure cursor is positioned after DOM updates, then focus
		tick().then(() => {
			updateCursorPos(currentIndex);
			hiddenInput?.focus();
		});
	}

	function updateCursorPos(index) {
		const el = document.querySelector(`[data-index="${index}"]`);
		if (!el) return;
		const elRect = el.getBoundingClientRect();
		const parent = el.closest('.typing-area-container') || el.offsetParent || document.body;
		const parentRect = parent.getBoundingClientRect();
		const left = elRect.left - parentRect.left;
		// place cursor slightly before the character
		cursorLeft = Math.round(left) - 12;
		// use bounding rect for vertical positioning
		cursorTop = Math.round(elRect.top - parentRect.top) - (elRect.height - 8);
	}

	afterUpdate(() => {
		updateCursorPos(currentIndex);
	});

	let resizeHandler;
	onMount(() => {
		resizeHandler = () => {
			updateCursorPos(currentIndex);
		};
		window.addEventListener('resize', resizeHandler);
		initGame();
	});
	onDestroy(() => {
		clearInterval(timerInterval);
		window.removeEventListener('resize', resizeHandler);
	});

	function handleKeydown(e) {
		if (isFinished) return;
		if (e.key === 'Tab') {
			e.preventDefault();
			initGame();
			return;
		}
		if (!isPlaying && e.key.length === 1) startGame();
		if (e.key === 'Backspace') {
			e.preventDefault();
			return;
		}
		if (e.key.length !== 1) return;

		const typed = e.key;
		const entry = getCharByGlobalIndex(currentIndex);
		if (!entry || !entry.ch || !entry.ch.charObj) return;

		const currentCharObj = entry.ch.charObj;
		if (typed === currentCharObj.text) {
			currentCharObj.correct = true;
			currentCharObj.incorrect = false;
			if (currentIndex === diamondIndex) collectDiamond();
			typingScore += PTS_PER_CHAR;
			currentTotalScore += PTS_PER_CHAR;
			currentIndex++;
			words = [...words];
			rocketTransform = 'scaleX(-1) translate(50%, 20px)';
			setTimeout(() => (rocketTransform = 'scaleX(-1) translate(50%, 20px)'), 100);
		} else if (currentIndex > 0) {
			const prev = getCharByGlobalIndex(currentIndex - 1);
			if (prev && typed === (prev.ch.charObj && prev.ch.charObj.text)) {
				currentIndex--;
				if (currentIndex === diamondIndex) collectDiamond();
				rocketTransform = 'scaleX(1) translate(-50%, 20px)';
				setTimeout(() => (rocketTransform = 'scaleX(1) translate(-50%, 20px)'), 100);
			} else {
				currentCharObj.incorrect = true;
				words = [...words];
				setTimeout(() => {
					if (currentCharObj.incorrect) {
						currentCharObj.incorrect = false;
						words = [...words];
					}
				}, 200);
			}
		}
		e.preventDefault();
		hiddenInput.value = '';
	}

	function handleFocus() {
		focusLost = false;
	}
	function handleBlur() {
		if (!isFinished) focusLost = true;
	}

	$: timeDisplay = timeLeft.toFixed(1);
	$: totalScoreDisplay = Math.floor(currentTotalScore);
</script>

<!-- Page structure: header, main, footer, modal -->
<div class="min-h-screen flex flex-col bg-background text-on-background font-['Plus_Jakarta_Sans'] overflow-hidden antialiased selection:bg-transparent">
	<header class="w-full max-w-5xl mx-auto p-8 flex flex-col items-center mt-8">
		<div class="w-full flex justify-between items-center">
			<h1 class="text-3xl font-extrabold tracking-tighter text-primary">
				type<span class="text-on-background">rush</span>
			</h1>
			<div class="flex gap-10 text-tertiary font-bold">
				<div class="flex flex-col items-center">
					<span class="text-[10px] text-outline uppercase tracking-[0.2em] mb-1 font-black">Score</span>
					<span class="text-3xl font-black text-on-background">{totalScoreDisplay}</span>
				</div>
				<div class="flex flex-col items-center min-w-[80px]">
					<span class="text-[10px] text-outline uppercase tracking-[0.2em] mb-1 font-black">Time Left</span>
					<span
						class="text-3xl font-black transition-colors duration-300"
						class:time-warning={timeLeft <= 10}
					>{timeDisplay}</span>
				</div>
				<div class="flex flex-col items-center border-l border-outline-variant pl-8">
					<span class="text-[10px] text-outline uppercase tracking-[0.2em] mb-1 font-black">Diamonds</span>
					<div class="flex items-center gap-2">
						<span class="text-2xl">💎</span>
						<span class="text-3xl font-black">{diamondsCollected}</span>
					</div>
				</div>
			</div>
		</div>
	</header>

	<main
		class="flex-grow flex items-center justify-center p-6 w-full max-w-5xl mx-auto relative overflow-hidden cursor-text"
		on:click={() => setTimeout(() => hiddenInput?.focus(), 0)}
	>
		<!-- Focus Overlay -->
		{#if focusLost && !isFinished}
			<div class="absolute inset-0 z-50 flex items-center justify-center rounded-xl blur-overlay cursor-pointer"
				on:click={() => setTimeout(() => hiddenInput?.focus(), 0)}>
				<p class="text-primary text-xl font-bold flex items-center gap-2 pointer-events-none">
					<span class="material-symbols-outlined">center_focus_strong</span>
					Click to start Type Rush
				</p>
			</div>
		{/if}

		<input
			bind:this={hiddenInput}
			type="text"
			autocomplete="off"
			spellcheck="false"
			class="absolute left-[-9999px] top-[-9999px] opacity-0"
			on:keydown={handleKeydown}
			on:focus={handleFocus}
			on:blur={handleBlur}
		/>

		<div class="typing-area-container w-full break-words relative outline-none select-none text-center">
			<!-- Cursor container -->
			<div
				class="absolute transition-transform duration-100 ease-out pointer-events-none z-10"
				style="transform: translateX({cursorLeft}px) translateY({cursorTop}px);"
				class:cursor-blink={!focusLost && !isFinished}
			>
				<div style="transform: {rocketTransform};">🚲</div>
				<div class="w-[3px] h-8 bg-primary rounded-md mt-1"></div>
			</div>

			<!-- Characters (nested words -> chars) -->
			<div id="words" class="flex flex-wrap gap-x-1 sm:gap-x-3 gap-y-1 sm:gap-y-2 justify-center">
				{#each words as word, wi}
					<div class="word flex" data-word-index={wi}>
						{#each word.chars as ch}
							<span
								bind:this={ch.el}
								class="char relative font-mono text-4xl leading-relaxed transition-all duration-100 inline-block"
								class:correct={ch.charObj && ch.charObj.correct}
								class:incorrect={ch.charObj && ch.charObj.incorrect}
								data-index={ch.globalIndex}
							>
								{ch.charObj ? (ch.charObj.text === ' ' ? '\u00A0' : ch.charObj.text) : '\u00A0'}
								{#if ch.charObj && ch.charObj.diamond}
									<div class="diamond-indicator absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-float pointer-events-none z-20">💎</div>
								{/if}
							</span>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</main>

	<footer class="w-full pb-16 flex flex-col items-center gap-4">
		<div class="text-outline text-sm font-medium opacity-60 flex items-center gap-6">
			<span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">keyboard</span> Type to move</span>
			<span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">diamond</span> 💎 = +500 pts</span>
			<span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">timer</span> 60s Challenge</span>
		</div>
		<button
			class="group flex items-center justify-center p-4 rounded-full hover:bg-surface-container-high text-outline hover:text-primary transition-all duration-200 outline-none"
			on:click={initGame}>
			<span class="material-symbols-outlined text-4xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
		</button>
	</footer>
</div>

<!-- Results Modal -->
{#if showResults}
	<div class="fixed inset-0 z-[100] flex items-center justify-center blur-overlay transition-opacity duration-300">
		<div class="bg-white border border-outline-variant p-12 rounded-[40px] shadow-2xl scale-100 transition-transform duration-300 flex flex-col items-center gap-8 max-w-md w-full">
			<div class="text-center">
				<h2 class="text-4xl font-black text-primary italic">TIME'S UP!</h2>
				<p class="text-outline text-xs mt-3 uppercase tracking-[0.3em] font-black">Type Rush Results</p>
			</div>
			<div class="w-full space-y-4">
				<div class="flex justify-between items-center bg-background p-4 px-6 rounded-2xl border border-outline-variant">
					<span class="text-xs text-outline uppercase font-black">Typing Score</span>
					<span class="text-xl font-black text-on-background">{typingScore}</span>
				</div>
				<div class="flex justify-between items-center bg-background p-4 px-6 rounded-2xl border border-outline-variant">
					<span class="text-xs text-outline uppercase font-black">Diamonds Found</span>
					<div class="flex items-center gap-2">
						<span class="text-xl font-black text-tertiary">{diamondsCollected}</span>
						<span class="text-xs font-bold text-outline">(+{diamondsCollected * PTS_PER_DIAMOND})</span>
					</div>
				</div>
				<div class="flex justify-between items-center bg-on-background p-6 rounded-[24px] text-white shadow-2xl">
					<span class="text-sm uppercase font-black tracking-widest">Final Score</span>
					<span class="text-4xl font-black">{totalScoreDisplay}</span>
				</div>
			</div>
			<button
				class="px-8 py-5 bg-primary text-white text-xl font-black rounded-3xl hover:bg-on-background transition-all w-full shadow-lg flex items-center justify-center gap-3"
				on:click={initGame}>
				<span class="material-symbols-outlined">bolt</span>
				<span>TRY AGAIN</span>
			</button>
		</div>
	</div>
{/if}

<style>
	.material-symbols-outlined {
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}

	.typing-area-container {
		font-family: 'JetBrains Mono', monospace;
		font-size: 2.25rem;
		line-height: 1.6;
		position: relative;
	}

	.char {
		color: #936e6b; /* outline color */
		transition: all 0.1s ease;
		display: inline-block;
		position: relative;
	}

	.char.correct {
		color: #2a1615; /* on-background */
		font-weight: 700;
	}

	.char.incorrect {
		color: #ba1a1a; /* error */
		animation: shake 0.2s ease-in-out;
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-4px); }
		75% { transform: translateX(4px); }
	}

	.cursor-blink div:last-child {
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	.blur-overlay {
		backdrop-filter: blur(8px);
		background-color: rgba(255, 248, 247, 0.8);
	}

	.diamond-indicator {
		filter: drop-shadow(0 0 8px rgba(0, 163, 255, 0.4));
		animation: float 0.6s infinite ease-in-out alternate;
	}

	@keyframes float {
		from { transform: translateX(-50%) translateY(0px); }
		to { transform: translateX(-50%) translateY(-6px); }
	}

	.time-warning {
		color: #ba1a1a;
		animation: pulse-red 0.5s infinite alternate;
	}

	@keyframes pulse-red {
		from { opacity: 1; transform: scale(1); }
		to { opacity: 0.7; transform: scale(1.1); }
	}
</style>