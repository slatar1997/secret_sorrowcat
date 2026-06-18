import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { DIARY_PHOTO_PATHS } from './DiaryGame';

declare global {
  namespace NodeJS {
    type Timeout = number;
  }
}

interface FinalSceneProps {
  selectedQuizImages: string[];
  isTortillaCooked: boolean;
  onBackToDesk: () => void;
}

interface SandboxItem {
  id: string;
  src: string;
  type: 'polaroid' | 'quiz' | 'tortilla';
  caption: string;
  initialX: number;
  initialY: number;
  initialRotate: number;
}

interface TypewriterProps {
  text: string;
  onComplete?: () => void;
  instant?: boolean;
}

// Typewriter effect component
function Typewriter({ text, onComplete, instant }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState(instant ? text : '');
  const [index, setIndex] = useState(instant ? text.length : 0);

  useEffect(() => {
    if (instant) {
      setDisplayedText(text);
      if (onComplete) onComplete();
      return;
    }
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete, instant]);

  return <span>{displayedText}</span>;
}

function FinalScene({ selectedQuizImages, isTortillaCooked, onBackToDesk }: FinalSceneProps) {
  const [isKeyUnlocked, setIsKeyUnlocked] = useState<boolean>(false);
  const [isLidRemoved, setIsLidRemoved] = useState<boolean>(false);
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const [noBtnPosition, setNoBtnPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTrolled, setIsTrolled] = useState<boolean>(false);
  const [typewriterDone, setTypewriterDone] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLDivElement>(null);
  const hasUnlockedRef = useRef<boolean>(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate explosion items outside 500x500px center safe zone
  const [sandboxItems] = useState<SandboxItem[]>(() => {
    const rawItems: { id: string; src: string; type: 'polaroid' | 'quiz' | 'tortilla'; caption: string; }[] = [
      ...DIARY_PHOTO_PATHS.map((src, i) => ({
        id: `diary-${i}`,
        src,
        type: 'polaroid' as const,
        caption: `Memories 💕`,
      })),
      ...selectedQuizImages.slice(-2).map((src, i) => ({
        id: `quiz-${i}`,
        src,
        type: 'quiz' as const,
        caption: `Chosen Quiz 🧩`,
      })),
    ];

    if (isTortillaCooked) {
      rawItems.push({
        id: 'tortilla-cooked',
        src: '/images/tortilla/tortilla_complete.png',
        type: 'tortilla' as const,
        caption: 'Cooked Tortilla 🌮',
      });
    }

    return rawItems.map((item) => {
      // Safe zone size: 500px x 500px -> Either |x| > 250 or |y| > 250
      const isLeftRight = Math.random() > 0.5;
      let initialX = 0;
      let initialY = 0;

      if (isLeftRight) {
        // Left (-450 to -260) or Right (260 to 450)
        initialX = Math.random() > 0.5
          ? -260 - Math.random() * 190
          : 260 + Math.random() * 190;
        initialY = (Math.random() - 0.5) * 580; // Full height range
      } else {
        // Top (-380 to -260) or Bottom (260 to 380)
        initialX = (Math.random() - 0.5) * 750; // Full width range
        initialY = Math.random() > 0.5
          ? -260 - Math.random() * 120
          : 260 + Math.random() * 120;
      }

      const initialRotate = (Math.random() - 0.5) * 50; // -25 to 25 degrees
      return {
        ...item,
        initialX,
        initialY,
        initialRotate,
      };
    });
  });

  // Handle Box Opening on drag-success
  const handleBoxOpen = useCallback(() => {
    if (hasUnlockedRef.current) return;
    hasUnlockedRef.current = true;
    setIsKeyUnlocked(true);
    setIsLidRemoved(true);

    try {
      const audio = new Audio('/sounds/unlock.mp3');
      audio.volume = 0.9;
      audio.play().catch((err) => console.warn('Unlock audio play failed:', err));
    } catch (err) {
      console.warn('Unlock audio failed:', err);
    }
  }, []);

  // Check overlap collision between key and box
  const handleKeyDragEnd = useCallback(() => {
    if (boxRef.current && keyRef.current) {
      const boxRect = boxRef.current.getBoundingClientRect();
      const keyRect = keyRef.current.getBoundingClientRect();

      const overlap = !(
        keyRect.right < boxRect.left ||
        keyRect.left > boxRect.right ||
        keyRect.bottom < boxRect.top ||
        keyRect.top > boxRect.bottom
      );

      if (overlap) {
        handleBoxOpen();
      }
    }
  }, [handleBoxOpen]);

  // Open the envelope/letter
  const handleOpenLetter = useCallback(() => {
    setIsLetterOpen(true);
  }, []);

  // Handle Typewriter Finish and 5 Seconds Delay
  const handleTypewriterComplete = useCallback(() => {
    setTypewriterDone(true);
    if (!isAccepted) {
      const timeout = setTimeout(() => {
        setShowButtons(true);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isAccepted]);

  // Reset typewriter/buttons state when closing uncompleted letter
  useEffect(() => {
    if (!isLetterOpen && !isAccepted) {
      setTypewriterDone(false);
      setShowButtons(false);
      setIsTrolled(false);
      setNoBtnPosition({ x: 0, y: 0 });
    }
  }, [isLetterOpen, isAccepted]);

  // YES button scaling timer: counts up to 60 seconds when letter is open
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLetterOpen && !isAccepted) {
      setTimer(0);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 60) {
            if (interval) clearInterval(interval);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setTimer(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLetterOpen, isAccepted]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  // Troll button hover handler: warps to random position on mouse enter (infinite, no click needed)
  const handleTrollHover = useCallback(() => {
    setIsTrolled(true);

    // Random coordinates inside the card boundaries
    const randomX = (Math.random() - 0.5) * 450;
    const randomY = (Math.random() - 0.5) * 200 - 30;
    setNoBtnPosition({ x: randomX, y: randomY });

    // Trigger screen shake
    setIsShaking(true);
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false);
    }, 500);
  }, []);

  // Accept button handler — auto-fold letter and start confetti immediately
  const handleAccept = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing card
    setIsAccepted(true);
    setIsLetterOpen(false); // Auto-fold letter down immediately
  }, []);

  // Giant card close handler (allowed at any time)
  const handleCardClick = useCallback(() => {
    setIsLetterOpen(false);
  }, []);

  // Password-style heart confetti on fixed canvas — fires exactly 5 seconds, independent of letter state
  useEffect(() => {
    if (!isAccepted) return;
    if (!confettiCanvasRef.current) return;

    const myConfetti = confetti.create(confettiCanvasRef.current, {
      resize: true,
      useWorker: true,
    });

    const heartShape = confetti.shapeFromPath({
      path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    });

    // Exact same defaults from PasswordGate confetti
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

    // Fire initial burst immediately (same pattern as PasswordGate)
    myConfetti({ ...defaults, particleCount: 30, origin: { x: 0.2, y: 0.5 } });
    myConfetti({ ...defaults, particleCount: 30, origin: { x: 0.8, y: 0.5 } });
    myConfetti({ ...defaults, particleCount: 40, origin: { x: 0.5, y: 0.3 } });
    setTimeout(() => {
      myConfetti({ ...defaults, particleCount: 25, origin: { x: 0.3, y: 0.4 } });
      myConfetti({ ...defaults, particleCount: 25, origin: { x: 0.7, y: 0.4 } });
    }, 200);

    // Repeat bursts every 400ms for 5 seconds total
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      // Natural fade-out: reduce particle count as time progresses
      const progress = 1 - (timeLeft / duration); // 0 → 1 over 5s
      const scaleFactor = Math.max(0.15, 1 - progress * 0.85);

      myConfetti({ ...defaults, particleCount: Math.round(30 * scaleFactor), origin: { x: 0.2, y: 0.5 } });
      myConfetti({ ...defaults, particleCount: Math.round(30 * scaleFactor), origin: { x: 0.8, y: 0.5 } });
      myConfetti({ ...defaults, particleCount: Math.round(40 * scaleFactor), origin: { x: 0.5, y: 0.3 } });
    }, 400);

    return () => {
      clearInterval(interval);
      myConfetti.reset();
    };
  }, [isAccepted]);

  return (
    <motion.div
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center"
      animate={
        isShaking
          ? {
            x: [0, -12, 12, -10, 10, -6, 6, 0],
            y: [0, 8, -8, 6, -6, 4, -4, 0],
            transition: { duration: 0.5, ease: 'easeInOut' },
          }
          : { x: 0, y: 0 }
      }
    >
      {/* ── Wood table background (top-down view) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D2B48C] via-[#C4A47A] to-[#B8956A] z-0" />

      {/* Wood grain texture overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
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

      {/* ── Back button ── */}
      <motion.button
        type="button"
        className="absolute top-4 left-4 z-50 px-4 py-2 rounded-xl bg-white/30 border border-white/40 text-[#5C4A3A] font-bold cursor-pointer hover:bg-white/50 transition-colors shadow-md backdrop-blur-sm"
        style={{ fontFamily: "'Itim', cursive" }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBackToDesk}
      >
        ← กลับโต๊ะ
      </motion.button>

      {/* ── Heading instructions ── */}
      {!isLidRemoved && (
        <div className="absolute top-10 z-30 text-center max-w-sm px-4 pointer-events-none">
          <h1
            className="text-2xl font-bold text-[#D2691E] drop-shadow-sm"
            style={{ fontFamily: "'Itim', cursive" }}
          >
            🎁 Secret_Box
          </h1>
          <p
            className="text-xs text-[#8B5A2B] mt-1 font-semibold"
            style={{ fontFamily: "'Mali', cursive" }}
          >
            ลากกุญแจ 🔑 ไปทีกล่องเพื่อเปิด!
          </p>
        </div>
      )}

      {/* ── Sandbox Area for Exploded memory items (Placed outside 500x500 center safe zone) ── */}
      {isLidRemoved && (
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          {sandboxItems.map((item) => (
            <motion.div
              key={item.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-grab active:cursor-grabbing"
              initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{
                x: item.initialX,
                y: item.initialY,
                scale: 1.0,
                rotate: item.initialRotate,
              }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 14,
                delay: Math.random() * 0.4,
              }}
              drag
              dragMomentum={false}
              whileHover={{ scale: 1.15, zIndex: 40 }}
              whileDrag={{ scale: 1.1, zIndex: 50 }}
            >
              {item.type === 'tortilla' ? (
                <div className="flex flex-col items-center bg-white p-3 pb-4 rounded-2xl shadow-xl border border-amber-200 w-32 sm:w-36 select-none">
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-amber-50 shadow-inner">
                    <img
                      src={item.src}
                      alt={item.caption}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <span
                    className="text-[10px] sm:text-xs text-amber-800 font-bold mt-2.5 text-center"
                    style={{ fontFamily: "'Mali', cursive" }}
                  >
                    {item.caption}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col bg-white p-3 pb-5 rounded-lg shadow-xl border border-gray-150 w-32 sm:w-36 select-none">
                  <div className="aspect-square w-full rounded-sm overflow-hidden bg-gray-50 shadow-inner">
                    <img
                      src={item.src}
                      alt={item.caption}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <span
                    className="text-[10px] sm:text-xs text-[#6B5B4F] text-center mt-2.5 block truncate font-medium"
                    style={{ fontFamily: "'Mali', cursive" }}
                  >
                    {item.caption}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Key & Box Center Safe Zone Assembly ── */}
      <div className="relative z-20 flex flex-col items-center justify-center gap-8 w-[500px] h-[500px] pointer-events-none">

        {/* Draggable Key (Giant Scale) */}
        <AnimatePresence>
          {!isKeyUnlocked && (
            <motion.div
              ref={keyRef}
              className="absolute top-[-260px] sm:top-[-320px] left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing z-30 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              drag
              dragMomentum={false}
              onDragEnd={handleKeyDragEnd}
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.02 }}
            >
              <img
                src="/images/finale/key.png"
                alt="Vintage Key"
                className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] drop-shadow-2xl select-none"
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Box & Envelope Platter Stack */}
        <div ref={boxRef} className="relative w-[380px] h-[380px] sm:w-[450px] sm:h-[450px] flex items-center justify-center pointer-events-none">

          {/* Bottom Box body (Always visible, z-10) */}
          <img
            src="/images/finale/box.png"
            alt="Gift Box"
            className="absolute inset-0 w-full h-full object-contain drop-shadow-lg z-10 select-none"
            draggable={false}
          />

          {/* Envelope inside the Box — Click to open letter instantly (NO drag) */}
          <AnimatePresence>
            {isLidRemoved && (
              <motion.div
                className="absolute z-20 flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
                initial={{ scale: 0, y: 30 }}
                animate={{ scale: 1.0, y: 15 }}
                exit={{ scale: 0, y: -50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                onClick={handleOpenLetter}
              >
                <div className="relative w-48 h-40 flex items-center justify-center">
                  {/* Envelope Image — click on entire area opens the letter */}
                  <img
                    src="/images/finale/envelope.png"
                    alt="Envelope"
                    className="w-full h-full object-contain drop-shadow-xl select-none"
                    draggable={false}
                  />
                  {/* Pulsing red dot indicator */}
                  <div className="absolute top-[60%] w-2.5 h-2.5 rounded-full bg-red-500 animate-ping z-30 pointer-events-none" />
                  {/* Click hint */}
                  <span
                    className="absolute bottom-[-18px] text-[9px] text-rose-500 font-bold animate-pulse text-center pointer-events-none"
                    style={{ fontFamily: "'Mali', cursive" }}
                  >
                    คลิกเพื่อเปิดจดหมาย 💌
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Box Lid (pha.png, z-30) */}
          <AnimatePresence>
            {!isLidRemoved && (
              <motion.div
                className="absolute inset-0 w-full h-full z-30 select-none"
                initial={{ y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -100 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src="/images/finale/pha.png"
                  alt="Box Lid"
                  className="w-full h-full object-contain drop-shadow-md select-none"
                  draggable={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Secret Letter Dialog / Card ── */}
      <AnimatePresence>
        {isLetterOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 cursor-pointer"
            onClick={handleCardClick}
          >
            <motion.div
              className="w-[80vw] max-w-2xl h-[70vh] bg-[#fdfaf2] border-2 border-dashed border-rose-300 rounded-2xl relative p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-between cursor-pointer overflow-y-auto"
              initial={{ scale: 0.8, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              onClick={handleCardClick}
            >
              {/* Card Ribbon Accent */}
              <div className="w-20 h-5 bg-rose-200 rounded-full shadow-inner -mt-4 animate-pulse" />

              {/* Proposal Text Container */}
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <h2
                  className="text-3xl sm:text-5xl font-bold text-rose-500 text-center leading-relaxed font-['Mali']"
                  style={{ fontFamily: "'Mali', cursive" }}
                >
                  <Typewriter
                    text="ในที่สุดก็มาถึงตรงนี้จนได้นะ พี่ขอบคุณทุกอย่างที่หนูทำให้พี่เลย พี่มีความสุขมากตอนที่ได้อยู่กับหนู เป็นแฟนกันนะครับ"
                    onComplete={handleTypewriterComplete}
                    instant={isAccepted}
                  />
                </h2>
              </div>

              {/* Buttons controls */}
              <div
                className="relative w-full flex items-center justify-center mt-6 mb-12 min-h-[120px]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <AnimatePresence>
                  {showButtons && !isAccepted && (
                    <motion.div
                      className="flex items-center justify-center gap-32 w-full relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* YES button */}
                      <motion.button
                        type="button"
                        className="px-10 py-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-extrabold text-xl sm:text-2xl shadow-xl hover:shadow-rose-400/40 cursor-pointer active:scale-95 transition-all duration-200 z-10"
                        style={{ fontFamily: "'Itim', cursive" }}
                        onClick={handleAccept}
                        animate={{ scale: 1 + timer * 0.03 }}
                        whileHover={{ scale: (1 + timer * 0.03) * 1.05 }}
                        whileTap={{ scale: (1 + timer * 0.03) * 0.95 }}
                      >
                        เป็น
                      </motion.button>

                      {/* Escaping hover-troll NO button — warps on mouse enter only */}
                      <motion.button
                        type="button"
                        className="px-8 py-3 rounded-full bg-gray-200 text-gray-600 font-bold text-base sm:text-lg border border-gray-300 select-none shadow-md cursor-pointer transition-all duration-150"
                        style={{
                          fontFamily: "'Itim', cursive",
                          position: isTrolled ? 'absolute' : 'relative',
                          left: isTrolled ? noBtnPosition.x : undefined,
                          top: isTrolled ? noBtnPosition.y : undefined,
                          zIndex: 20,
                        }}
                        onMouseEnter={handleTrollHover}
                        onPointerOver={handleTrollHover}
                      >
                        ไม่เป็น
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Success Card Overlay ── */}
      <AnimatePresence>
        {isAccepted && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 pointer-events-auto cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onBackToDesk}
          >
            <motion.div
              className="w-[90vw] max-w-lg bg-[#fdfaf2] border-2 border-dashed border-rose-300 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center gap-6 relative cursor-default"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ribbon Accent */}
              <div className="w-20 h-5 bg-rose-200 rounded-full shadow-inner -mt-4 animate-pulse" />

              <span className="text-7xl animate-bounce mt-4">🥰</span>
              <h2
                className="text-4xl font-bold text-rose-600"
                style={{ fontFamily: "'Itim', cursive" }}
              >
                พี่รักหนูนะ
              </h2>
              <p
                className="text-base text-rose-500 leading-relaxed font-semibold mt-2"
                style={{ fontFamily: "'Mali', cursive" }}
              >
                ขอบคุณนะครับที่ตอบตกลง พี่จะเป็นแฟนที่ดีให้กับหนูเลยนะครับ
              </p>

              <motion.button
                type="button"
                className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-extrabold text-lg shadow-xl cursor-pointer"
                style={{ fontFamily: "'Itim', cursive" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToDesk}
              >
                กลับหน้าหลัก 🏠
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confetti Canvas — Fixed full-screen layer, always rendered, independent of letter state ── */}
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
      />
    </motion.div>
  );
}

export default FinalScene;
