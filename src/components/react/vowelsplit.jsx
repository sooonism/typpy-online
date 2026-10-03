import { useCallback, useEffect, useRef, useState } from "react";

// ─── Word pairs ──────────────────────────────────────────────
const WORD_PAIRS = [
	["horse", "riding"],
	["sun", "flower"],
	["butter", "fly"],
	["rain", "bow"],
	["star", "fish"],
	["moon", "light"],
	["fire", "works"],
	["thunder", "storm"],
	["snow", "flake"],
	["ice", "berg"],
	["water", "fall"],
	["mountain", "climb"],
	["forest", "fire"],
	["ocean", "wave"],
	["sky", "dive"],
	["rock", "climb"],
	["wind", "surf"],
	["surf", "board"],
	["skate", "board"],
	["snow", "board"],
	["thunder", "bolt"],
	["rain", "drop"],
	["sand", "wich"],
	["hand", "shake"],
	["brain", "storm"],
	["ear", "ring"],
	["eye", "lash"],
	["finger", "print"],
	["foot", "ball"],
	["basket", "ball"],
	["base", "ball"],
	["volley", "ball"],
	["soft", "ball"],
	["head", "phone"],
	["key", "board"],
	["note", "book"],
	["copy", "book"],
	["face", "book"],
	["grid", "lock"],
	["lady", "bug"],
];

const VOWELS = ["a", "e", "i", "o", "u"];
const GAME_DURATION = 10; // seconds

// ─── Difficulty levels ───────────────────────────────────────
const LEVELS = [
	{ id: "easy", label: "Easy", words: 2, desc: "2 words" },
	{ id: "medium", label: "Medium", words: 3, desc: "3 words" },
	{ id: "hard", label: "Hard", words: [4, 5], desc: "4–5 words" },
];

// ─── Helpers ──────────────────────────────────────────────────
function pickRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Every word fragment from the pair list, usable standalone
const WORD_POOL = [...new Set(WORD_PAIRS.flat())];

function pickWords(count) {
	const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

function generateRound(level) {
	const count = Array.isArray(level.words)
		? pickRandom(level.words)
		: level.words;
	const words = pickWords(count);
	const junction = Math.floor(Math.random() * (count - 1)); // where the vowel hides
	const vowel = pickRandom(VOWELS);
	const merged = words.map((w, i) => (i === junction ? w + vowel : w)).join("");
	return { words, junction, vowel, merged, level: level.id };
}

// ─── Main component ──────────────────────────────────────────
export default function VowerSplit() {
	// ── State ──
	const [gameState, setGameState] = useState("idle"); // 'idle' | 'playing' | 'done'
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
	const [levelId, setLevelId] = useState(() => {
		if (typeof localStorage === "undefined") return LEVELS[0].id;
		return (
			LEVELS.find((l) => l.id === localStorage.getItem("vowelsplit-level"))
				?.id || LEVELS[0].id
		);
	});
	const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
	const [round, setRound] = useState(() => generateRound(level));
	const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
	const [feedbackMsg, setFeedbackMsg] = useState("");
	const [wordAnim, setWordAnim] = useState("");

	// ── Refs ──
	const timerRef = useRef(null);
	const scorePopRef = useRef(null);

	// ── Start game ──
	const startGame = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setScore(0);
		setTimeLeft(GAME_DURATION);
		setRound(generateRound(level));
		setFeedback(null);
		setFeedbackMsg("");
		setWordAnim("");
		setGameState("playing");
	}, [level]);

	// ── Change difficulty ──
	const changeLevel = useCallback(
		(nextId) => {
			if (nextId === levelId) return;
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			const next = LEVELS.find((l) => l.id === nextId) || LEVELS[0];
			try {
				localStorage.setItem("vowelsplit-level", next.id);
			} catch {
				/* ignore */
			}
			setLevelId(next.id);
			setScore(0);
			setTimeLeft(GAME_DURATION);
			setRound(generateRound(next));
			setFeedback(null);
			setFeedbackMsg("");
			setWordAnim("");
			setGameState("idle");
		},
		[levelId],
	);

	// ── End game ──
	const endGame = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setGameState("done");
		setWordAnim("");
		setFeedback(null);
		setFeedbackMsg("");
	}, []);

	// ── Timer effect ──
	useEffect(() => {
		if (gameState !== "playing") return;

		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [gameState]);

	// ── End game when time runs out ──
	useEffect(() => {
		if (gameState === "playing" && timeLeft <= 0) {
			endGame();
		}
	}, [timeLeft, gameState, endGame]);

	// ── Handle guess ──
	const handleGuess = useCallback(
		(key) => {
			if (gameState !== "playing") return;
			if (!key || key.length !== 1) return;
			const char = key.toLowerCase();
			if (!/^[a-z]$/.test(char)) return;

			const isCorrect = char === round.vowel;

			if (isCorrect) {
				setScore((s) => s + 1);
				setFeedback("correct");
				setFeedbackMsg(`✓ "${round.vowel}"`);
				setWordAnim("correct");

				if (scorePopRef.current) {
					scorePopRef.current.classList.remove("pop");
					void scorePopRef.current.offsetWidth;
					scorePopRef.current.classList.add("pop");
				}

				setTimeout(() => {
					setRound(generateRound(level));
					setFeedback(null);
					setFeedbackMsg("");
					setWordAnim("");
				}, 120);
			} else {
				setFeedback("wrong");
				setFeedbackMsg(`✗ "${char}"`);
				setWordAnim("wrong");
				setTimeout(() => {
					setFeedback(null);
					setFeedbackMsg("");
					setWordAnim("");
				}, 300);
			}
		},
		[gameState, round, level],
	);

	// ── Keyboard listener ──
	useEffect(() => {
		const onKeyDown = (e) => {
			if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
				return;
			if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
				e.preventDefault();
				handleGuess(e.key);
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [handleGuess]);

	// ── Cleanup timer on unmount ──
	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	// ── Timer colour ──
	const timerColor = timeLeft <= 3 ? "danger" : timeLeft <= 5 ? "warning" : "";

	const isIdle = gameState === "idle";
	const isPlaying = gameState === "playing";
	const isDone = gameState === "done";

	return (
		<div className="vowel-page">
			<div className="game-card">
				{/* ─── Top bar ─── */}
				<div className="top-bar">
					<div className="timer-wrap">
						<span className="timer-icon">⏱</span>
						<span className={`timer-value ${timerColor}`}>
							{Math.ceil(timeLeft)}
						</span>
					</div>
					{isPlaying && (
						<div
							className="level-chip"
							aria-label={`Difficulty: ${level.label}`}
						>
							<span className="level-chip-label">Level</span>
							<span className="level-chip-value">{level.label}</span>
						</div>
					)}
					<div className="score-wrap">
						<span className="score-icon">⭐</span>
						<span className="score-value" ref={scorePopRef}>
							{score}
						</span>
					</div>
				</div>

				{/* ─── Center ─── */}
				<div className="center-area">
					<div
						className={`word-display ${wordAnim} ${isIdle ? "placeholder" : ""} ${!isIdle && round.merged.length > 14 ? "long" : ""}`}
					>
						{isIdle ? "⟳" : round.merged}
					</div>
					<div className="hint-text">
						{isIdle && "Press START to begin"}
						{isPlaying && (
							<>
								Type the <strong>vowel</strong> hidden inside
							</>
						)}
						{isDone && "Time\u2019s up!"}
					</div>
				</div>

				{/* ─── Feedback ─── */}
				<div className="feedback-row">
					{feedback === "correct" && (
						<span className="fb-correct">{feedbackMsg} ✔</span>
					)}
					{feedback === "wrong" && (
						<span className="fb-wrong">{feedbackMsg} ✘</span>
					)}
					{!feedback && isPlaying && (
						<span className="fb-idle">⌨️ type or tap a vowel</span>
					)}
					{!feedback && !isPlaying && !isIdle && (
						<span className="fb-idle">—</span>
					)}
					{isIdle && <span className="fb-idle">ready when you are</span>}
				</div>

				{/* ─── Vowel keys (mobile / touch) ─── */}
				<div className="vowel-keys">
					{VOWELS.map((v) => (
						<button
							key={v}
							className="vowel-btn"
							data-vowel={v}
							onClick={() => handleGuess(v)}
							disabled={!isPlaying}
							aria-label={`Type vowel ${v}`}
						>
							{v}
						</button>
					))}
				</div>

				{/* ─── Overlay: Start / Done ─── */}
				<div className={`overlay ${isIdle || isDone ? "visible" : ""}`}>
					{isIdle && (
						<>
							<div className="overlay-title">🔤 VowerSplit</div>
							<div className="overlay-sub">
								Type the missing vowel. <br />
								Fast as you can!
							</div>
							<div className="level-select">
								<div className="level-select-label">Difficulty</div>
								<div className="level-select-row">
									{LEVELS.map((l) => (
										<button
											key={l.id}
											className={`level-btn ${l.id === levelId ? "active" : ""}`}
											onClick={() => changeLevel(l.id)}
										>
											<span className="level-btn-label">{l.label}</span>
											<span className="level-btn-desc">{l.desc}</span>
										</button>
									))}
								</div>
							</div>
							<button className="btn-primary" onClick={startGame}>
								Start 10s
							</button>
							<div className="overlay-example">
								e.g. <strong>horseariding</strong> → type <em>a</em>
							</div>
						</>
					)}

					{isDone && (
						<>
							<span className="sr-only" role="alert">Time up. {score} words solved.</span>
							<div className="overlay-title overlay-title-small">
								⏱ Time Up!
							</div>
							<div className="overlay-score">{score}</div>
							<div className="overlay-score-label">words solved</div>
							<div className="level-select">
								<div className="level-select-label">Difficulty</div>
								<div className="level-select-row">
									{LEVELS.map((l) => (
										<button
											key={l.id}
											className={`level-btn ${l.id === levelId ? "active" : ""}`}
											onClick={() => changeLevel(l.id)}
										>
											<span className="level-btn-label">{l.label}</span>
											<span className="level-btn-desc">{l.desc}</span>
										</button>
									))}
								</div>
							</div>
							<button className="btn-primary" onClick={startGame}>
								Play Again
							</button>
							<button
								className="btn-secondary"
								onClick={() => {
									setGameState("idle");
									setScore(0);
									setTimeLeft(GAME_DURATION);
									setRound(generateRound(level));
									setFeedback(null);
									setFeedbackMsg("");
									setWordAnim("");
								}}
							>
								← Home
							</button>
						</>
					)}
				</div>
			</div>

			<style>{`
        /* ── Page wrapper (was body/#root) ── */
        .vowel-page {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          background: radial-gradient(circle at top right, rgba(230, 0, 35, 0.10), transparent 30%), linear-gradient(135deg, #fff8f7 0%, #ffe9e7 100%);
          width: 100%;
          max-width: 720px;
          height: min(600px, calc(100dvh - 180px));
          min-height: 420px;
          margin: 0 auto;
          border-radius: 48px;
          border: 1px solid #e8bcb8;
          box-shadow: 0 24px 60px -44px rgba(42, 22, 21, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          touch-action: manipulation;
        }

        /* ── Glass card ── */
        .game-card {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 48px;
          border: 1px solid rgba(232, 188, 184, 0.9);
          box-shadow: 0 30px 80px -52px rgba(42, 22, 21, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.85);
          padding: 24px 24px 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: opacity 0.25s ease;
        }

        /* subtle animated glow */
        .game-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 20%, rgba(230, 0, 35, 0.07), transparent 60%);
          pointer-events: none;
          animation: glowDrift 12s ease-in-out infinite alternate;
        }
        @keyframes glowDrift {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(10%, 8%);
          }
        }

        /* ── Top bar: timer + score ── */
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .timer-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffe9e7;
          padding: 6px 18px 6px 14px;
          border-radius: 60px;
          border: 1px solid #e8bcb8;
        }
        .timer-icon {
          font-size: 22px;
          line-height: 1;
        }
        .timer-value {
          font-size: 32px;
          font-weight: 700;
          color: #2a1615;
          letter-spacing: 0.5px;
          min-width: 36px;
          text-align: center;
          font-variant-numeric: tabular-nums;
          transition: color 0.2s;
        }
        .timer-value.warning {
          color: #e60023;
        }
        .timer-value.danger {
          color: #ba1a1a;
          animation: pulse 0.5s ease-in-out infinite alternate;
        }
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0.6;
            transform: scale(0.96);
          }
        }

        .score-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffe9e7;
          padding: 6px 18px 6px 14px;
          border-radius: 60px;
          border: 1px solid #e8bcb8;
        }
        .score-icon {
          font-size: 20px;
          line-height: 1;
        }
        .score-value {
          font-size: 32px;
          font-weight: 700;
          color: #005f90;
          min-width: 28px;
          text-align: center;
          font-variant-numeric: tabular-nums;
          transition: transform 0.15s ease;
        }
        .score-value.pop {
          animation: pop 0.25s ease;
        }
        @keyframes pop {
          0% {
            transform: scale(0.6);
          }
          60% {
            transform: scale(1.25);
          }
          100% {
            transform: scale(1);
          }
        }

        /* ── Center area: word ── */
        .center-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 8px 0;
          min-height: 0;
        }

        .word-display {
          font-size: clamp(44px, 10vw, 88px);
          font-weight: 800;
          color: #2a1615;
          letter-spacing: 2px;
          text-shadow: 0 4px 30px rgba(183, 0, 26, 0.12);
          transition: color 0.15s, transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
          text-align: center;
          line-height: 1.2;
          word-break: break-all;
          padding: 0 4px;
        }
        .word-display.correct {
          color: #103c25;
          transform: scale(0.96);
        }
        .word-display.wrong {
          color: #ba1a1a;
          transform: scale(0.96) rotate(-1deg);
        }
        .word-display.placeholder {
          color: rgba(147, 110, 107, 0.35);
        }

        .hint-text {
          margin-top: 12px;
          font-size: 18px;
          font-weight: 400;
          color: #936e6b;
          letter-spacing: 1px;
          transition: opacity 0.2s;
        }
        .hint-text strong {
          color: #5e3f3c;
          font-weight: 600;
        }

        /* ── Feedback row ── */
        .feedback-row {
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.2s;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .feedback-row .fb-correct {
          color: #103c25;
        }
        .feedback-row .fb-wrong {
          color: #ba1a1a;
        }
        .feedback-row .fb-idle {
          color: rgba(147, 110, 107, 0.4);
          font-weight: 400;
          font-size: 15px;
        }

        /* ── Vowel keys (mobile) ── */
        .vowel-keys {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 12px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          padding: 4px 0;
        }

        .vowel-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          background: #ffffff;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid #e8bcb8;
          color: #2a1615;
          font-size: 28px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 4px 12px rgba(42, 22, 21, 0.1);
          touch-action: manipulation;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .vowel-btn:not(:disabled):hover {
          background: #fff0ef;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(42, 22, 21, 0.14);
        }
        .vowel-btn:not(:disabled):active {
          transform: scale(0.9);
          background: #ffe9e7;
        }
        .vowel-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
          transform: scale(0.95);
          pointer-events: none;
        }
        /* individual vowel colours – subtle */
        .vowel-btn[data-vowel='a'] {
          background: rgba(239, 68, 68, 0.25);
        }
        .vowel-btn[data-vowel='e'] {
          background: rgba(251, 191, 36, 0.25);
        }
        .vowel-btn[data-vowel='i'] {
          background: rgba(52, 211, 153, 0.25);
        }
        .vowel-btn[data-vowel='o'] {
          background: rgba(59, 130, 246, 0.25);
        }
        .vowel-btn[data-vowel='u'] {
          background: rgba(168, 85, 247, 0.25);
        }
        .vowel-btn:not(:disabled)[data-vowel='a']:hover {
          background: rgba(239, 68, 68, 0.45);
        }
        .vowel-btn:not(:disabled)[data-vowel='e']:hover {
          background: rgba(251, 191, 36, 0.45);
        }
        .vowel-btn:not(:disabled)[data-vowel='i']:hover {
          background: rgba(52, 211, 153, 0.45);
        }
        .vowel-btn:not(:disabled)[data-vowel='o']:hover {
          background: rgba(59, 130, 246, 0.45);
        }
        .vowel-btn:not(:disabled)[data-vowel='u']:hover {
          background: rgba(168, 85, 247, 0.45);
        }

        /* ── Overlay Start / Game Over ── */
        .overlay {
          position: absolute;
          inset: 0;
          border-radius: 48px;
          background: rgba(255, 248, 247, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding: 32px;
          overflow-y: auto;
          transition: opacity 0.4s ease, transform 0.4s ease;
          opacity: 0;
          pointer-events: none;
          transform: scale(0.96);
        }
        .overlay.visible {
          opacity: 1;
          pointer-events: auto;
          transform: scale(1);
        }

        .overlay-title {
          font-size: clamp(40px, 8vw, 64px);
          font-weight: 800;
          color: #2a1615;
          margin-bottom: 6px;
          letter-spacing: 1px;
        }
        .overlay-title-small {
          font-size: clamp(32px, 6vw, 48px);
        }
        .overlay-sub {
          font-size: 20px;
          color: #5e3f3c;
          margin-bottom: 20px;
          font-weight: 400;
          text-align: center;
        }
        .overlay-example {
          margin-top: 16px;
          font-size: 14px;
          color: #936e6b;
        }
        .overlay-example strong {
          color: #5e3f3c;
        }
        .overlay-example em {
          color: #b7001a;
          font-style: normal;
        }
        .overlay-score {
          font-size: 72px;
          font-weight: 800;
          color: #b7001a;
          line-height: 1;
          margin-bottom: 4px;
        }
        .overlay-score-label {
          font-size: 16px;
          color: #936e6b;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 24px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #b7001a 0%, #e60023 55%, #ff5c75 140%);
          border: none;
          padding: 16px 52px;
          border-radius: 60px;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 30px rgba(183, 0, 26, 0.35);
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 40px rgba(183, 0, 26, 0.45);
        }
        .btn-primary:active {
          transform: scale(0.96);
        }

        .btn-secondary {
          background: #ffffff;
          border: 1px solid #e8bcb8;
          padding: 14px 40px;
          border-radius: 60px;
          font-size: 18px;
          font-weight: 600;
          color: #5e3f3c;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
          margin-top: 12px;
        }
        .btn-secondary:hover {
          background: #fff0ef;
          transform: translateY(-1px);
        }

        /* ── Level select ── */
        .level-select {
          margin-bottom: 20px;
          text-align: center;
        }
        .level-select-label {
          font-size: 12px;
          font-weight: 700;
          color: #936e6b;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }
        .level-select-row {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .level-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 10px 18px;
          border-radius: 18px;
          border: 1px solid #e8bcb8;
          background: #ffffff;
          color: #5e3f3c;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .level-btn:hover {
          background: #fff0ef;
          transform: translateY(-1px);
        }
        .level-btn.active {
          background: linear-gradient(135deg, #b7001a 0%, #e60023 55%, #ff5c75 140%);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 8px 24px rgba(183, 0, 26, 0.3);
        }
        .level-btn-label {
          font-size: 15px;
          font-weight: 700;
          line-height: 1.1;
        }
        .level-btn-desc {
          font-size: 11px;
          opacity: 0.75;
          line-height: 1.1;
        }

        /* ── Level chip (in top bar while playing) ── */
        .level-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff0ef;
          padding: 6px 16px 6px 14px;
          border-radius: 60px;
          border: 1px solid #e8bcb8;
        }
        .level-chip-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #936e6b;
        }
        .level-chip-value {
          font-size: 15px;
          font-weight: 700;
          color: #b7001a;
        }

        .word-display.long {
          font-size: clamp(30px, 6vw, 54px);
          letter-spacing: 1px;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .vowel-page {
            border-radius: 32px;
          }
          .game-card {
            border-radius: 32px;
            padding: 18px 16px 16px;
          }
          .overlay {
            border-radius: 32px;
          }
          .timer-value,
          .score-value {
            font-size: 26px;
          }
          .timer-wrap,
          .score-wrap {
            padding: 4px 12px 4px 10px;
          }
          .word-display {
            font-size: clamp(32px, 12vw, 56px);
          }
          .hint-text {
            font-size: 15px;
          }
          .overlay-score {
            font-size: 56px;
          }
          .btn-primary {
            padding: 14px 36px;
            font-size: 17px;
          }
          .vowel-btn {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }
          .vowel-keys {
            gap: 10px;
          }
          .level-select-row {
            flex-wrap: wrap;
            gap: 8px;
          }
          .level-btn {
            padding: 8px 14px;
          }
          .level-chip-label {
            display: none;
          }
        }
        @media (max-height: 560px) {
          .vowel-page {
            height: calc(100dvh - 140px);
            min-height: 340px;
            border-radius: 28px;
          }
          .game-card {
            padding: 14px 14px 12px;
            border-radius: 28px;
          }
          .overlay {
            border-radius: 28px;
          }
          .word-display {
            font-size: clamp(28px, 8vh, 48px);
          }
          .top-bar {
            gap: 8px;
          }
          .timer-value,
          .score-value {
            font-size: 22px;
          }
          .feedback-row {
            height: 22px;
            font-size: 15px;
          }
          .hint-text {
            font-size: 14px;
            margin-top: 6px;
          }
          .vowel-btn {
            width: 42px;
            height: 42px;
            font-size: 20px;
          }
          .vowel-keys {
            gap: 8px;
            margin-top: 6px;
          }
        }
        @media (max-height: 440px) {
          .vowel-btn {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
          .vowel-keys {
            gap: 6px;
            margin-top: 4px;
          }
        }
      `}</style>
		</div>
	);
}
