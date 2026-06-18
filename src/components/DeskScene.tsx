import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** Identifies which sub-scene (mini-game) the hub can navigate to */
type DeskSubScene = 'hub' | 'tortilla' | 'vinyl' | 'diary' | 'secretbox';

interface DeskSceneProps {
  isTortillaCooked: boolean;
  isVinylPlayed: boolean;
  isDiaryRead: boolean;
  onOpenTortilla: () => void;
  onOpenVinyl: () => void;
  onOpenDiary: () => void;
  onOpenSecretBox: () => void;
}

interface DeskButtonConfig {
  id: string;
  label: string;
  emoji: string;
  subScene: DeskSubScene;
  clearedFlag: boolean;
  bgColor: string;
  bgHover: string;
  borderColor: string;
  glowColor: string;
  onOpen: () => void;
}

// Subtle wobble animation for attention-grabbing (after 5s idle)
const wobbleVariant = {
  wobble: {
    rotate: [0, -3, 3, -2, 2, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const,
      repeat: Infinity,
      repeatDelay: 4,
    },
  },
  idle: {
    rotate: 0,
  },
};

function DeskScene({
  isTortillaCooked,
  isVinylPlayed,
  isDiaryRead,
  onOpenTortilla,
  onOpenVinyl,
  onOpenDiary,
  onOpenSecretBox,
}: DeskSceneProps) {
  const [shouldWobble, setShouldWobble] = useState<boolean>(false);
  const [showGoldUnlockAnim, setShowGoldUnlockAnim] = useState<boolean>(false);
  const [hasPlayedUnlock, setHasPlayedUnlock] = useState<boolean>(false);

  // Check box unlock state
  const isBoxUnlocked = isTortillaCooked && isVinylPlayed && isDiaryRead;

  // Handle unlock sound and animation trigger
  useEffect(() => {
    if (isBoxUnlocked && !hasPlayedUnlock) {
      const alreadyPlayed = sessionStorage.getItem('played_box_unlock');
      if (!alreadyPlayed) {
        const audio = new Audio('/sounds/unlock.mp3');
        audio.play().catch((err) => console.warn('Unlock sound play error:', err));
        sessionStorage.setItem('played_box_unlock', 'true');
        setShowGoldUnlockAnim(true);
      }
      setHasPlayedUnlock(true);
    }
  }, [isBoxUnlocked, hasPlayedUnlock]);

  // Start wobble guide animation after 5 seconds of idle
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldWobble(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Reset wobble timer whenever a button is pressed (user is interacting)
  const handleButtonClick = useCallback((onOpen: () => void) => {
    setShouldWobble(false);
    onOpen();
  }, []);

  const buttons: DeskButtonConfig[] = [
    {
      id: 'desk-btn-tortilla',
      label: 'Tortilla',
      emoji: '🌮',
      subScene: 'tortilla',
      clearedFlag: isTortillaCooked,
      bgColor: 'bg-amber-50',
      bgHover: 'hover:bg-amber-100',
      borderColor: 'border-amber-300',
      glowColor: 'shadow-amber-200/50',
      onOpen: onOpenTortilla,
    },
    {
      id: 'desk-btn-vinyl',
      label: 'Vinyl',
      emoji: '🎧',
      subScene: 'vinyl',
      clearedFlag: isVinylPlayed,
      bgColor: 'bg-rose-50',
      bgHover: 'hover:bg-rose-100',
      borderColor: 'border-rose-300',
      glowColor: 'shadow-rose-200/50',
      onOpen: onOpenVinyl,
    },
    {
      id: 'desk-btn-diary',
      label: 'Diary',
      emoji: '📖',
      subScene: 'diary',
      clearedFlag: isDiaryRead,
      bgColor: 'bg-sky-50',
      bgHover: 'hover:bg-sky-100',
      borderColor: 'border-sky-300',
      glowColor: 'shadow-sky-200/50',
      onOpen: onOpenDiary,
    },
    {
      id: 'desk-btn-secretbox',
      label: 'Secret Box',
      emoji: '🎁',
      subScene: 'secretbox',
      clearedFlag: false, // Secret box has its own unlock logic
      bgColor: isBoxUnlocked ? 'bg-purple-50' : 'bg-gray-100 opacity-60',
      bgHover: isBoxUnlocked ? 'hover:bg-purple-100' : '',
      borderColor: isBoxUnlocked ? 'border-purple-300' : 'border-gray-300',
      glowColor: isBoxUnlocked ? 'shadow-purple-200/50' : 'shadow-none',
      onOpen: onOpenSecretBox,
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* ── Wood table background (top-down view) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D2B48C] via-[#C4A47A] to-[#B8956A] z-0" />

      {/* Wood grain texture overlay */}
      <div className="absolute inset-0 z-0 opacity-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-[#8B6914]/40"
            style={{ top: `${8 + i * 8}%` }}
          />
        ))}
      </div>

      {/* Soft shadow around edges (desk edge vignette) */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.15)] z-0 pointer-events-none" />

      {/* ── Central content container (responsive) ── */}
      <motion.div
        className="relative z-10 w-full max-w-md px-6 flex flex-col items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#5C3317] drop-shadow-sm"
            style={{ fontFamily: "'Itim', cursive" }}
          >
            Mini Game
          </h1>
          <p
            className="text-sm text-[#8B6914] opacity-70 mt-1"
            style={{ fontFamily: "'Mali', cursive" }}
          >
            เลือกสิ่งที่อยากทำบนโต๊ะนี้
          </p>
        </motion.div>

        {/* ── 2x2 Button Grid ── */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {buttons.map((btn, idx) => {
            const isCleared = btn.clearedFlag;
            const needsWobble = shouldWobble && !isCleared && btn.subScene !== 'secretbox';
            const isSecretBox = btn.subScene === 'secretbox';
            const isDisabled = isSecretBox && !isBoxUnlocked;

            return (
              <motion.div
                key={btn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6 + idx * 0.15,
                  duration: 0.4,
                  ease: 'easeOut',
                }}
              >
                <motion.button
                  id={btn.id}
                  type="button"
                  className={`relative overflow-hidden w-full flex flex-col items-center justify-center gap-2 p-5 sm:p-6 rounded-2xl border-2 ${btn.borderColor} ${btn.bgColor} ${btn.bgHover} shadow-lg ${btn.glowColor} ${isDisabled ? 'pointer-events-none select-none' : 'cursor-pointer transition-colors duration-200 select-none'}`}
                  style={{ fontFamily: "'Itim', cursive" }}
                  variants={wobbleVariant}
                  animate={needsWobble ? 'wobble' : 'idle'}
                  whileHover={isDisabled ? {} : { scale: 1.05 }}
                  whileTap={isDisabled ? {} : { scale: 0.95 }}
                  onClick={() => handleButtonClick(btn.onOpen)}
                  disabled={isDisabled}
                >
                  {/* Emoji icon */}
                  <span className="text-3xl sm:text-4xl">{btn.emoji}</span>

                  {/* Label */}
                  <span className="text-sm sm:text-base font-bold text-[#5C3317]">
                    {btn.label}
                  </span>

                  {/* Cleared badge */}
                  {isCleared && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-400 flex items-center justify-center shadow-md animate-bounce"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <span className="text-white text-sm font-bold">✓</span>
                    </motion.div>
                  )}

                  {/* Locked/Unlocked Padlock Overlays for Secret Box */}
                  {isSecretBox && (
                    <AnimatePresence>
                      {!isBoxUnlocked ? (
                        <motion.div
                          key="gray-lock"
                          className="absolute inset-0 bg-gray-900/40 rounded-xl flex flex-col items-center justify-center pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <span className="text-3xl text-gray-300 drop-shadow-sm">🔒</span>
                          <span className="text-[10px] text-gray-200 mt-1 font-semibold" style={{ fontFamily: "'Mali', cursive" }}>
                            ล็อกอยู่
                          </span>
                        </motion.div>
                      ) : (
                        showGoldUnlockAnim && (
                          <motion.div
                            key="gold-lock"
                            className="absolute inset-0 bg-yellow-500/20 rounded-xl flex flex-col items-center justify-center pointer-events-none"
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{
                              rotate: [0, -10, 10, -10, 10, 0],
                              scale: [1, 1.15, 1],
                              y: -30,
                              opacity: 0,
                            }}
                            transition={{ duration: 1.6, ease: 'easeOut' }}
                            onAnimationComplete={() => setShowGoldUnlockAnim(false)}
                          >
                            <span className="text-4xl drop-shadow-[0_0_10px_rgba(253,224,71,0.9)] text-yellow-300">🔓</span>
                            <span className="text-xs font-bold text-yellow-300 mt-1 drop-shadow-md" style={{ fontFamily: "'Mali', cursive" }}>
                              ปลดล็อกแล้ว!
                            </span>
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Progress hint */}
        <motion.p
          className="text-xs text-[#8B6914]/50 text-center mt-2"
          style={{ fontFamily: "'Mali', cursive" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          {isBoxUnlocked ? '🎉 ปลดล็อกกล่องลับแล้ว! กดเข้าชมได้เลย' : 'ทำมินิเกมให้ครบเพื่อปลดล็อกกล่องลับ ✨'}
        </motion.p>
      </motion.div>
    </div>
  );
}

export default DeskScene;
