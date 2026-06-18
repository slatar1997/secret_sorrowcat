import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PasswordGateProps {
  onUnlocked: () => void;
}

// Pastel candy color palette for the 12 keypad buttons
const BUTTON_COLORS: string[] = [
  'bg-pink-200 hover:bg-pink-300 active:bg-pink-400',
  'bg-purple-200 hover:bg-purple-300 active:bg-purple-400',
  'bg-blue-200 hover:bg-blue-300 active:bg-blue-400',
  'bg-green-200 hover:bg-green-300 active:bg-green-400',
  'bg-yellow-200 hover:bg-yellow-300 active:bg-yellow-400',
  'bg-orange-200 hover:bg-orange-300 active:bg-orange-400',
  'bg-rose-200 hover:bg-rose-300 active:bg-rose-400',
  'bg-teal-200 hover:bg-teal-300 active:bg-teal-400',
  'bg-indigo-200 hover:bg-indigo-300 active:bg-indigo-400',
  'bg-amber-200 hover:bg-amber-300 active:bg-amber-400',
  'bg-lime-200 hover:bg-lime-300 active:bg-lime-400',
  'bg-cyan-200 hover:bg-cyan-300 active:bg-cyan-400',
];

// Button layout: 1-9, then empty-0-backspace row
const KEYPAD_LAYOUT: (string | null)[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [null, '0', '⌫'],
];

const CORRECT_PASSWORD = '2003';
const MAX_LENGTH = 4;

function PasswordGate({ onUnlocked }: PasswordGateProps) {
  const [input, setInput] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [flashOpacity, setFlashOpacity] = useState<number>(0);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Fire heart-shaped confetti burst
  const fireHeartConfetti = useCallback(() => {
    const heartShape = confetti.shapeFromPath({
      path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    });

    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0.4,
      decay: 0.94,
      startVelocity: 20,
      shapes: [heartShape],
      colors: ['#ff69b4', '#ff1493', '#ff6b9d', '#c71585', '#db7093', '#ffb6c1'],
      scalar: 2,
    };

    confetti({ ...defaults, particleCount: 30, origin: { x: 0.2, y: 0.5 } });
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.8, y: 0.5 } });
    confetti({ ...defaults, particleCount: 40, origin: { x: 0.5, y: 0.3 } });

    setTimeout(() => {
      confetti({ ...defaults, particleCount: 25, origin: { x: 0.3, y: 0.4 } });
      confetti({ ...defaults, particleCount: 25, origin: { x: 0.7, y: 0.4 } });
    }, 200);
  }, []);

  // Unlock browser audio context (for mobile Safari/Chrome autoplay policy)
  const unlockAudioContext = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      ctx.resume();
    }
  }, []);

  // Validate password when input reaches 4 digits
  const validatePassword = useCallback(
    (currentInput: string) => {
      if (currentInput.length === MAX_LENGTH) {
        if (currentInput === CORRECT_PASSWORD) {
          // SUCCESS
          setIsSuccess(true);
          unlockAudioContext();
          fireHeartConfetti();

          // Flash warp effect then transition
          setTimeout(() => setFlashOpacity(1), 300);
          setTimeout(() => {
            onUnlocked();
          }, 1200);
        } else {
          // FAILURE — shake & reset
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setInput('');
          }, 500);
        }
      }
    },
    [onUnlocked, unlockAudioContext, fireHeartConfetti]
  );

  // Handle digit/backspace input from keypad
  const handleKeypadPress = useCallback(
    (key: string) => {
      if (isSuccess || isShaking) return;

      setPressedKey(key);
      setTimeout(() => setPressedKey(null), 150);

      if (key === '⌫') {
        setInput((prev) => prev.slice(0, -1));
        return;
      }

      setInput((prev) => {
        if (prev.length >= MAX_LENGTH) return prev;
        const next = prev + key;
        // Schedule validation on next tick after state update
        setTimeout(() => validatePassword(next), 0);
        return next;
      });
    },
    [isSuccess, isShaking, validatePassword]
  );

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess || isShaking) return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadPress('⌫');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeypadPress, isSuccess, isShaking]);

  // Map flat index to color
  const getButtonColor = (rowIdx: number, colIdx: number): string => {
    const flatIndex = rowIdx * 3 + colIdx;
    return BUTTON_COLORS[flatIndex % BUTTON_COLORS.length];
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#FFF0F5' }}>

      {/* Flash Warp Overlay */}
      <AnimatePresence>
        {flashOpacity > 0 && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ backgroundColor: '#fffaf0' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: flashOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* Title */}
      <motion.h1
        className="text-3xl sm:text-4xl font-bold text-pink-400 mb-2"
        style={{ fontFamily: "'Itim', cursive" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🔒 ใส่รหัสลับ
      </motion.h1>

      <motion.p
        className="text-sm text-pink-300 mb-6 opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        กดรหัส 4 หลักเพื่อปลดล็อก...
      </motion.p>

      {/* Shake wrapper for keypad + display */}
      <motion.div
        className="flex flex-col items-center gap-6"
        animate={
          isShaking
            ? {
                x: [0, -12, 12, -10, 10, -6, 6, 0],
                transition: { duration: 0.5, ease: 'easeInOut' },
              }
            : { x: 0 }
        }
      >
        {/* Password Display Slots */}
        <div className="flex gap-3 sm:gap-4 mb-2">
          {Array.from({ length: MAX_LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-bold transition-colors duration-200 ${
                input[i]
                  ? 'border-pink-400 bg-white/80 text-pink-500 shadow-md'
                  : 'border-pink-200 bg-white/40 text-transparent'
              }`}
              style={{ fontFamily: "'Itim', cursive" }}
              animate={
                input[i]
                  ? { scale: [0.8, 1.15, 1], transition: { duration: 0.25 } }
                  : { scale: 1 }
              }
            >
              {input[i] ? '●' : '○'}
            </motion.div>
          ))}
        </div>

        {/* Keypad Grid 3x4 */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {KEYPAD_LAYOUT.map((row, rowIdx) =>
            row.map((key, colIdx) => {
              if (key === null) {
                return <div key={`empty-${rowIdx}-${colIdx}`} className="w-18 h-18 sm:w-20 sm:h-20" />;
              }

              const isBackspace = key === '⌫';
              const colorClass = isBackspace
                ? 'bg-red-200 hover:bg-red-300 active:bg-red-400'
                : getButtonColor(rowIdx, colIdx);

              return (
                <motion.button
                  key={`key-${key}`}
                  type="button"
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full ${colorClass} text-gray-700 text-2xl sm:text-3xl font-bold shadow-lg cursor-pointer select-none transition-colors duration-150 active:shadow-inner`}
                  style={{ fontFamily: isBackspace ? 'sans-serif' : "'Itim', cursive" }}
                  whileTap={{ scale: 0.88 }}
                  animate={
                    pressedKey === key
                      ? { scale: [1, 0.88, 1], transition: { duration: 0.15 } }
                      : { scale: 1 }
                  }
                  onClick={() => handleKeypadPress(key)}
                >
                  {key}
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Error hint text */}
      <AnimatePresence>
        {isShaking && (
          <motion.p
            className="absolute bottom-12 text-red-400 text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            รหัสไม่ถูกต้อง ลองใหม่อีกครั้งนะ 💕
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PasswordGate;
