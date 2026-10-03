import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Heart, Shield, Binary } from 'lucide-react';

// Expanded word bank categorized by length
const WORD_MAP = {
  5: [
    "HELLO", "REACT", "WORLD", "APPLE", "SMART", "BRAIN", "LIGHT", "SPACE", "DREAM", "POWER",
    "FLAME", "MUSIC", "PIANO", "THINK", "GHOST", "CLOCK", "WATER", "EARTH", "FRESH", "LEMON",
    "BREAD", "STORM", "CLOUD", "TABLE", "MOUSE", "SMILE", "NIGHT", "GRAPE", "BEACH", "TRAIN",
    "SHARK", "PHONE", "HOUSE", "PLANE", "SHIRT", "PAPER", "PLANT", "FRUIT", "BRUSH", "WHEEL"
  ],
  6: [
    "SYSTEM", "CODING", "FUTURE", "PLANET", "SILVER", "DRAGON", "BRIDGE", "ROCKET", "WINDOW", "ORANGE",
    "BOTTLE", "CANDLE", "CHURCH", "COFFEE", "DOCTOR", "ENGINE", "FLOWER", "GARDEN", "GUITAR", "HAMMER",
    "ISLAND", "JACKET", "KITTEN", "LAPTOP", "MARKET", "NATURE", "OFFICE", "PENCIL", "RABBIT", "SCHOOL",
    "TICKET", "VALLEY", "WINTER", "YELLOW", "ZODIAC", "STREAM", "BRIGHT", "SUMMER", "FOREST", "ENERGY"
  ],
  7: [
    "PROGRAM", "DESKTOP", "SCIENCE", "MYSTERY", "GLITTER", "THUNDER", "MORNING", "NETWORK", "KITCHEN", "FLOWERS",
    "AIRPORT", "BALLOON", "CAPTAIN", "DIAMOND", "FEATHER", "GIRAFFE", "HOLIDAY", "JOURNEY", "LANTERN", "MONSTER",
    "OCTOPUS", "PENGUIN", "QUARTET", "RAINBOW", "STADIUM", "TURBINE", "UNICORN", "VAMPIRE", "WHISTLE", "EXPLORE",
    "CRYSTAL", "PYRAMID", "VICTORY", "WARRIOR", "WEATHER", "HISTORY", "SILENCE", "FREEDOM", "DYNAMIC", "KINDRED"
  ],
  8: [
    "COMPUTER", "MOUNTAIN", "UNIVERSE", "KEYBOARD", "PLATFORM", "STRENGTH", "EVERYDAY", "SUNSHINE", "BIRTHDAY", "FEEDBACK",
    "ABSOLUTE", "BOUNDARY", "CALENDAR", "DATABASE", "ELEGANCE", "FIREWORK", "GRADIENT", "HORIZONS", "INFINITY", "JUNCTION",
    "KINETICS", "LOCATION", "MOVEMENT", "NOTEBOOK", "OVERVIEW", "PORTRAIT", "QUESTION", "REACTION", "SPECTRUM", "TRIANGLE",
    "UMBRELLA", "VELOCITY", "WILDLIFE", "XENOPHON", "YESTERDAY", "ZUCCHINI", "SYMPHONY", "WILDNESS", "RESONANT", "PARADISE"
  ]
};

const App = () => {
  // Game State
  const [targetWord, setTargetWord] = useState('');
  const [scrambledArray, setScrambledArray] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState('playing'); // playing, success, error, gameover
  const [shake, setShake] = useState(false);
  
  // Progression State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [currentWordLength, setCurrentWordLength] = useState(5);
  const [difficultyStep, setDifficultyStep] = useState(0); // 0: Pin F&L, 1: Pin F, 2: Pin L, 3: Full Scramble

  // We use a ref to prevent unnecessary re-renders or double-calls during setup
  const isInitialMount = useRef(true);

  // Scramble Logic
  const generateScramble = (word, step) => {
    const chars = word.split('');
    const len = chars.length;
    
    const shuffle = (array) => {
      let shuffled;
      do {
        shuffled = [...array].sort(() => Math.random() - 0.5);
      } while (shuffled.join('') === array.join('') && array.length > 1);
      return shuffled;
    };

    if (step === 0) {
      const middle = shuffle(chars.slice(1, -1));
      return [chars[0], ...middle, chars[len - 1]];
    } else if (step === 1) {
      const rest = shuffle(chars.slice(1));
      return [chars[0], ...rest];
    } else if (step === 2) {
      const rest = shuffle(chars.slice(0, -1));
      return [...rest, chars[len - 1]];
    } else {
      return shuffle(chars);
    }
  };

  // Optimized Init Game
  const initGame = useCallback((isNewGame = false) => {
    let length = currentWordLength;
    let step = difficultyStep;

    if (isNewGame) {
      setScore(0);
      setLives(5);
      setTotalCorrect(0);
      setCurrentWordLength(5);
      setDifficultyStep(0);
      length = 5;
      step = 0;
    }

    const words = WORD_MAP[length] || WORD_MAP[8];
    const word = words[Math.floor(Math.random() * words.length)];
    
    setTargetWord(word);
    setScrambledArray(generateScramble(word, step));
    setUserInput('');
    setStatus('playing');
  }, [currentWordLength, difficultyStep]);

  // Initial load only
  useEffect(() => {
    if (isInitialMount.current) {
      initGame();
      isInitialMount.current = false;
    }
  }, [initGame]);

  // Handle Win Logic
  const handleWin = useCallback(() => {
    setStatus('success');
    const pointsGained = currentWordLength * 10;
    setScore(prev => {
      const newScore = prev + pointsGained;
      if (newScore > highScore) setHighScore(newScore);
      return newScore;
    });

    const newTotalCorrect = totalCorrect + 1;
    setTotalCorrect(newTotalCorrect);

    // Progression calculation
    let nextStep = difficultyStep + 1;
    let nextLen = currentWordLength;

    if (nextStep > 3) {
      nextStep = 0;
      nextLen = currentWordLength + 1;
      if (nextLen > 8) nextLen = 5;
    }

    // Health refill
    if (newTotalCorrect % 5 === 0) {
      setLives(prev => Math.min(prev + 1, 5));
    }

    // Update state and queue next word
    setDifficultyStep(nextStep);
    setCurrentWordLength(nextLen);
    
    setTimeout(() => {
      const words = WORD_MAP[nextLen] || WORD_MAP[8];
      const word = words[Math.floor(Math.random() * words.length)];
      setTargetWord(word);
      setScrambledArray(generateScramble(word, nextStep));
      setUserInput('');
      setStatus('playing');
    }, 800);
  }, [currentWordLength, difficultyStep, totalCorrect, highScore]);

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status !== 'playing') return;
      
      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        if (targetWord[userInput.length] === char) {
          const nextInput = userInput + char;
          setUserInput(nextInput);
          
          if (nextInput === targetWord) {
            handleWin();
          }
        } else {
          setShake(true);
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) setStatus('gameover');
            return newLives;
          });
          setTimeout(() => setShake(false), 400);
          setUserInput('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, targetWord, status, handleWin]);

  return (
    <div className="w-full px-4 pb-12 pt-6 sm:px-6 sm:pt-8 text-on-surface overflow-hidden">
      <div className="mx-auto w-full max-w-5xl">
        <header className="w-full p-4 sm:p-6 flex flex-col items-center mt-2 sm:mt-4">
          <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 px-2 sm:px-4 gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-primary">
                scramble<span className="text-on-surface">type</span>
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full border border-outline-variant bg-surface-container px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant sm:text-xs">
                  Len {currentWordLength}
                </span>
                <span className="rounded-full border border-outline-variant bg-surface-container px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant sm:text-xs">
                  Step {difficultyStep + 1}/4
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:items-end">
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-5 w-5 transition-all duration-300 ${i < lives ? 'text-error fill-error' : 'text-outline-variant'}`}
                  />
                ))}
              </div>

              <div className="flex bg-surface-container px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold text-on-surface-variant gap-4 sm:gap-6 shadow-sm border border-outline-variant">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-outline">Points</span>
                  <span className="font-mono text-lg sm:text-xl text-tertiary">{score}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-outline">Record</span>
                  <span className="font-mono text-lg sm:text-xl text-tertiary">{highScore}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 flex rounded-full border border-outline-variant bg-surface-container px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-on-surface-variant gap-3 sm:gap-4 shadow-sm text-center">
            <span>Unscramble the word one letter at a time. Every 5 clears restores 1 life.</span>
          </div>
        </header>

        {status === 'gameover' ? (
          <div role="alert" className="mx-auto mt-4 w-full max-w-md rounded-2xl border border-outline-variant bg-background p-6 sm:p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
            <Shield className="mx-auto mb-5 h-16 w-16 text-error opacity-70" />
            <h2 className="mb-2 text-4xl sm:text-5xl font-black tracking-tighter text-primary">System Failure</h2>
            <p className="mb-8 text-sm font-bold uppercase tracking-[0.22em] text-outline">Final Score: {score}</p>
            <button
              onClick={() => initGame(true)}
              className="w-full rounded-2xl border-4 border-primary bg-primary px-8 py-4 text-lg font-extrabold uppercase tracking-[0.16em] text-white shadow-2xl transition-all hover:bg-brand-red"
            >
              Reboot System
            </button>
          </div>
        ) : (
          <main className="flex w-full items-center justify-center px-2 sm:px-6">
            <div className={`w-full max-w-3xl px-2 py-4 sm:px-0 sm:py-6 transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
              <div className="flex flex-col items-center">
                <div className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-10 sm:gap-3 opacity-60">
                  {scrambledArray.map((char, idx) => (
                    <div
                      key={`scramble-${idx}`}
                      className="flex h-12 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-base font-bold text-outline shadow-inner sm:h-16 sm:w-12 sm:text-2xl"
                    >
                      {char}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 min-h-[88px] sm:min-h-[124px]">
                  {targetWord.split('').map((char, idx) => {
                    const isFilled = idx < userInput.length;
                    const isCurrent = idx === userInput.length;

                    return (
                      <div
                        key={`input-${idx}`}
                        className={`
                          relative flex h-16 w-12 items-center justify-center rounded-2xl text-3xl font-black transition-all duration-300 sm:h-24 sm:w-20 sm:text-5xl
                          ${isFilled
                            ? 'border border-[#0079b6] bg-[#0079b6] text-white shadow-[0_8px_20px_rgba(0,121,182,0.2)] -translate-y-1'
                            : 'border-2 border-dashed border-outline-variant bg-surface-container-low text-transparent'
                          }
                          ${isCurrent && status === 'playing' ? 'border-primary scale-105 shadow-[0_0_0_4px_rgba(183,0,26,0.12)]' : ''}
                          ${shake && isCurrent ? 'border-error bg-error-container text-error' : ''}
                        `}
                      >
                        {isFilled ? char : ''}
                        {isCurrent && status === 'playing' && (
                          <div className="absolute -bottom-5 h-2 w-2 rounded-full bg-primary animate-ping" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex h-16 flex-col items-center justify-center sm:mt-10">
                {status === 'success' && (
                  <div className="flex items-center gap-3 text-base sm:text-lg font-black text-tertiary animate-pulse uppercase tracking-[0.16em]">
                    <Binary className="animate-spin-slow" />
                    Stabilizing...
                  </div>
                )}
                {totalCorrect > 0 && totalCorrect % 5 === 0 && status === 'playing' && (
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-tertiary">
                    +1 Life Restored
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        <footer className="mx-auto mt-4 flex w-full max-w-3xl items-center justify-between px-2 text-outline sm:mt-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em]">
            <span>{totalCorrect} Units Cleared</span>
          </div>

          <button
            onClick={() => initGame(true)}
            className="group flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Reset Core</span>
          </button>
        </footer>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-15px); }
          40% { transform: translateX(15px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;