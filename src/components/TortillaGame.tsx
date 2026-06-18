import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import confetti from 'canvas-confetti';

type GamePhase = 'chopping' | 'cooking' | 'assembly' | 'folding' | 'success';

interface TortillaGameProps {
  onComplete: () => void;
  onBackToDesk: () => void;
}

function TortillaGame({ onComplete, onBackToDesk }: TortillaGameProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('chopping');

  // ─── Phase 1: Chopping States ───
  const [chopCount, setChopCount] = useState(0);
  const [isChopping, setIsChopping] = useState(false);

  // ─── Phase 2: Cooking States ───
  const [cookingProgress, setCookingProgress] = useState(0);
  const cookingAudioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Phase 3: Assembly States ───
  const [placedIngredients, setPlacedIngredients] = useState({
    chicken: false,
    lettuce: false,
    sauce: false,
  });
  const tortillaRef = useRef<HTMLDivElement>(null);

  // ─── Phase 4: Folding States ───
  const [folded, setFolded] = useState({
    left: false,
    right: false,
  });

  // ─── Phase 1: Chopping Logic ───
  const handleChop = useCallback(() => {
    if (chopCount < 6) {
      const nextCount = chopCount + 1;
      setChopCount(nextCount);
      setIsChopping(true);

      // Play cutting sound on every click (allow overlapping via new instance)
      const cuttingAudio = new Audio('/sounds/cutting.mp3');
      cuttingAudio.play().catch((err) => console.log('Audio play error:', err));

      setTimeout(() => setIsChopping(false), 100);

      if (nextCount >= 6) {
        setTimeout(() => {
          setGamePhase('cooking');
        }, 500);
      }
    }
  }, [chopCount]);

  // ─── Phase 2: Cooking Audio & Loading Bar Logic ───
  useEffect(() => {
    if (gamePhase !== 'cooking') return;

    // Start cooking sound loop
    const audio = new Audio('/sounds/cooking.mp3');
    audio.loop = true;
    audio.play().catch((err) => console.log('Cooking audio play error:', err));
    cookingAudioRef.current = audio;

    const startTime = Date.now();
    const duration = 6000; // 6 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setCookingProgress(progress);

      if (progress >= 100) {
        clearInterval(timer);

        // Stop cooking sound immediately when done
        if (cookingAudioRef.current) {
          cookingAudioRef.current.pause();
          cookingAudioRef.current = null;
        }

        setTimeout(() => {
          setGamePhase('assembly');
        }, 500);
      }
    }, 50);

    return () => {
      clearInterval(timer);
      if (cookingAudioRef.current) {
        cookingAudioRef.current.pause();
        cookingAudioRef.current = null;
      }
    };
  }, [gamePhase]);

  // ─── Phase 3: Drag & Drop Collision Logic ───
  const handleDragEnd = useCallback(
    (type: 'chicken' | 'lettuce', _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!tortillaRef.current) return;
      const rect = tortillaRef.current.getBoundingClientRect();
      const { x, y } = info.point;

      // Drop collision detection with the central tortilla area
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        setPlacedIngredients((prev) => ({ ...prev, [type]: true }));
      }
    },
    []
  );

  // ─── Phase 4: Folding Click Actions (Immediate Switch) ───
  const handleFoldClick = useCallback((side: 'left' | 'right') => {
    setFolded((prev) => {
      const updated = { ...prev, [side]: true };
      // Immediately switch to success when both sides are folded
      if (updated.left && updated.right) {
        setTimeout(() => setGamePhase('success'), 300);
      }
      return updated;
    });
  }, []);

  // ─── Success Phase: Confetti & localStorage saving ───
  useEffect(() => {
    if (gamePhase !== 'success') return;

    // Heart Confetti explosion
    const heartShape = confetti.shapeFromText({ text: '❤️', scalar: 2 });
    confetti({
      particleCount: 75,
      spread: 90,
      origin: { x: 0.5, y: 0.5 },
      shapes: [heartShape],
      scalar: 2.5,
      ticks: 100,
      gravity: 0.5,
      startVelocity: 30,
    });

    const completionTimer = setTimeout(() => {
      localStorage.setItem('isTortillaCooked', 'true');
      onComplete();
    }, 2000);

    return () => clearTimeout(completionTimer);
  }, [gamePhase, onComplete]);

  return (
    <motion.div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF9F2] via-[#FFF3E3] to-[#FFEAD2]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Decorative Kitchen Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle, #D4A373 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Floating Kitchen Icons Background */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden opacity-10">
        <span className="absolute top-[10%] left-[10%] text-4xl">🍳</span>
        <span className="absolute top-[15%] right-[15%] text-4xl">🥬</span>
        <span className="absolute bottom-[20%] left-[12%] text-4xl">🍗</span>
        <span className="absolute bottom-[15%] right-[10%] text-4xl">🍅</span>
        <span className="absolute top-[40%] right-[8%] text-4xl">🧂</span>
      </div>

      {/* Back Button */}
      {gamePhase !== 'success' && (
        <motion.button
          type="button"
          onClick={onBackToDesk}
          className="absolute top-6 left-6 z-50 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#FFE3C8] text-[#8C6239] font-bold shadow-md cursor-pointer transition-all duration-200 hover:bg-[#FFEAD2] active:scale-95 flex items-center gap-2"
          style={{ fontFamily: "'Itim', cursive" }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span>🏠</span> กลับโต๊ะทำงาน
        </motion.button>
      )}

      {/* Mini Game Container */}
      <div className="relative z-10 w-full max-w-xl px-4 flex flex-col items-center justify-center min-h-[75vh]">
        <AnimatePresence mode="wait">
          {/* ─── PHASE 1: CHOPPING ─── */}
          {gamePhase === 'chopping' && (
            <motion.div
              key="chopping"
              className="flex flex-col items-center gap-6 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2
                className="text-3xl font-extrabold text-[#7F4E29] drop-shadow-sm text-center"
                style={{ fontFamily: "'Itim', cursive" }}
              >
                🔪 หั่นเนื้อไก่เตรียมปรุงรส
              </h2>

              <p
                className="text-base text-[#B08968] font-medium text-center"
                style={{ fontFamily: "'Mali', cursive" }}
              >
                แตะรัวๆ บนเนื้อไก่เพื่อสับให้ละเอียด ({chopCount}/6 ครั้ง)
              </p>

              {/* Progress Indicator Dots */}
              <div className="flex gap-2.5 my-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border-2 border-[#D4A373] ${i < chopCount ? 'bg-[#D4A373] shadow-sm' : 'bg-transparent'
                      }`}
                    animate={i < chopCount ? { scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>

              {/* Cutting Board & Chicken Container */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl bg-gradient-to-b from-[#E6CCB2] to-[#DDB892] border-4 border-[#B08968] shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Wood Grain Effect */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-[2px] bg-[#7F4E29]"
                      style={{ top: `${10 + i * 9}%` }}
                    />
                  ))}
                </div>

                {/* Raw Chicken Button */}
                <motion.button
                  type="button"
                  onClick={handleChop}
                  className="relative w-48 h-48 cursor-pointer select-none active:outline-none focus:outline-none"
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isChopping
                      ? {
                        rotate: [-4, 4, -4],
                        scale: [1, 0.95, 1.02, 1],
                      }
                      : { rotate: 0, scale: 1 }
                  }
                  transition={{ duration: 0.15 }}
                >
                  <img
                    src="/images/tortilla/chicken.png"
                    alt="Raw Chicken"
                    className="w-full h-full object-contain drop-shadow-xl pointer-events-none"
                    draggable={false}
                  />

                  {/* Knife Slash Indicator overlay */}
                  <AnimatePresence>
                    {isChopping && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 1, scale: 0.6, rotate: -30 }}
                        animate={{ opacity: 0, scale: 1.4, rotate: 30 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-6xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">🔪</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE 2: COOKING LOADING BAR ─── */}
          {gamePhase === 'cooking' && (
            <motion.div
              key="cooking"
              className="flex flex-col items-center gap-8 w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center flex flex-col gap-2">
                <motion.h2
                  className="text-3xl font-extrabold text-[#7F4E29]"
                  style={{ fontFamily: "'Itim', cursive" }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🔥 Cooking...
                </motion.h2>
                <p
                  className="text-base text-[#B08968] font-medium"
                  style={{ fontFamily: "'Mali', cursive" }}
                >
                  กำลังทำให้ไก่สุก รอสักครู่
                </p>
              </div>

              {/* Cooking Simulation */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Cooking Steam */}
                <div className="absolute top-4 flex gap-4 pointer-events-none">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-8 bg-white/70 rounded-full blur-[1px]"
                      animate={{
                        y: [0, -20, -40],
                        opacity: [0, 0.8, 0],
                        scaleX: [1, 1.5, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>

                {/* Pan Graphic */}
                <div className="w-56 h-56 rounded-full bg-slate-800 border-8 border-slate-700 shadow-2xl relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <motion.div
                      className="w-40 h-40 rounded-full bg-[#FFE3C8] shadow-inner"
                      animate={{
                        scale: [1, 1.02, 1],
                        backgroundColor: ['#FFE3C8', '#E6CCB2', '#DDB892', '#FFE3C8'],
                      }}
                      transition={{ duration: 6, ease: 'linear' }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-sm flex flex-col gap-2">
                <div className="w-full h-5 bg-[#EDE0D4] rounded-full overflow-hidden border border-[#D4A373]/30 p-1 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D4A373] to-[#7F4E29] transition-all duration-75 ease-out shadow-sm"
                    style={{ width: `${cookingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#B08968] font-bold px-1" style={{ fontFamily: "'Mali', cursive" }}>
                  <span>ตั้งเตา</span>
                  <span>{Math.round(cookingProgress)}%</span>
                  <span>สุกได้ที่</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE 3: ASSEMBLY ─── */}
          {gamePhase === 'assembly' && (
            <motion.div
              key="assembly"
              className="flex flex-col items-center gap-5 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2
                className="text-3xl font-extrabold text-[#7F4E29] drop-shadow-sm text-center"
                style={{ fontFamily: "'Itim', cursive" }}
              >
                🫓 จัดเตรียมไส้และซอส
              </h2>

              <p
                className="text-sm text-[#B08968] font-medium text-center max-w-xs"
                style={{ fontFamily: "'Mali', cursive" }}
              >
                ลากวัตถุดิบไก่และผักลงบนแป้ง และคลิกขวดซอสเพื่อราดเพิ่มความอร่อย
              </p>

              {/* Main Workspace (Large Sizing) */}
              <div className="flex flex-row items-center justify-between gap-6 w-full mt-4 relative select-none">
                {/* Sidebar slots - Chicken, Lettuce, Sauce (w-24 h-24 / sm:w-28 sm:h-28) */}
                <div className="flex flex-col gap-6 z-20">
                  {/* Chicken Draggable Slot */}
                  <div className="relative flex flex-col items-center">
                    <AnimatePresence>
                      {!placedIngredients.chicken ? (
                        <motion.div
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-2 border-[#D4A373] shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-30 touch-none"
                          drag
                          dragSnapToOrigin
                          dragTransition={{ bounceStiffness: 600, bounceDamping: 25 }}
                          whileDrag={{ scale: 1.15, zIndex: 50, boxShadow: '0 8px 20px rgba(127,78,41,0.2)' }}
                          onDragEnd={(e, info) => handleDragEnd('chicken', e, info)}
                        >
                          <img
                            src="/images/tortilla/chicken_2.png"
                            alt="Cooked Chicken"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain pointer-events-none drop-shadow-md"
                            draggable={false}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-dashed border-[#D4A373]/30 bg-black/5 flex items-center justify-center text-green-500 font-bold text-xl">
                          ✓
                        </div>
                      )}
                    </AnimatePresence>
                    <span className="text-[11px] text-[#8C6239] font-bold mt-1" style={{ fontFamily: "'Mali', cursive" }}>เนื้อไก่ปรุงสุก</span>
                  </div>

                  {/* Lettuce Draggable Slot */}
                  <div className="relative flex flex-col items-center">
                    <AnimatePresence>
                      {!placedIngredients.lettuce ? (
                        <motion.div
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-2 border-[#D4A373] shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-30 touch-none"
                          drag
                          dragSnapToOrigin
                          dragTransition={{ bounceStiffness: 600, bounceDamping: 25 }}
                          whileDrag={{ scale: 1.15, zIndex: 50, boxShadow: '0 8px 20px rgba(127,78,41,0.2)' }}
                          onDragEnd={(e, info) => handleDragEnd('lettuce', e, info)}
                        >
                          <img
                            src="/images/tortilla/lettuce.png"
                            alt="Lettuce"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain pointer-events-none drop-shadow-md"
                            draggable={false}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-dashed border-[#D4A373]/30 bg-black/5 flex items-center justify-center text-green-500 font-bold text-xl">
                          ✓
                        </div>
                      )}
                    </AnimatePresence>
                    <span className="text-[11px] text-[#8C6239] font-bold mt-1" style={{ fontFamily: "'Mali', cursive" }}>ผักกาดหอม</span>
                  </div>

                  {/* Click-only Sauce Bottle Slot */}
                  <div className="relative flex flex-col items-center">
                    <AnimatePresence>
                      {!placedIngredients.sauce ? (
                        <motion.button
                          type="button"
                          onClick={() => setPlacedIngredients((prev) => ({ ...prev, sauce: true }))}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-2 border-[#D4A373] shadow-md flex items-center justify-center cursor-pointer z-30 hover:bg-[#FFF9F2] active:scale-95"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src="/images/tortilla/sauce.png"
                            alt="Sauce Bottle"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain pointer-events-none drop-shadow-md"
                            draggable={false}
                          />
                        </motion.button>
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-dashed border-[#D4A373]/30 bg-black/5 flex items-center justify-center text-green-500 font-bold text-xl">
                          ✓
                        </div>
                      )}
                    </AnimatePresence>
                    <span className="text-[11px] text-[#8C6239] font-bold mt-1" style={{ fontFamily: "'Mali', cursive" }}>ซอสมะเขือเทศ</span>
                  </div>
                </div>

                {/* Central Tortilla Base (w-80 h-80 / sm:w-96 sm:h-96) */}
                <div
                  ref={tortillaRef}
                  className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center bg-white/40 border-4 border-dashed border-[#FFE3C8] rounded-full p-2 animate-none"
                >
                  {/* Base Tortilla Dough (z-index 0) */}
                  <img
                    src="/images/tortilla/tortilla.png"
                    alt="Tortilla Base"
                    className="w-full h-full object-contain drop-shadow-xl pointer-events-none absolute inset-0 z-0 p-2"
                    draggable={false}
                  />

                  {/* Drop target visual indicator ring */}
                  <div className="absolute inset-6 rounded-full border border-[#D4A373]/30 pointer-events-none z-0" />

                  {/* ─── STACKED INGREDIENTS WITH STRICT LAYERING (Sauce on Top) ─── */}
                  {/* Lettuce & Chicken (z-index 10) - Bottom Layer */}
                  <AnimatePresence>
                    {placedIngredients.lettuce && (
                      <motion.img
                        src="/images/tortilla/lettuce.png"
                        className="absolute w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-sm rotate-[12deg] z-10 pointer-events-none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.95 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                        draggable={false}
                      />
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {placedIngredients.chicken && (
                      <motion.img
                        src="/images/tortilla/chicken_2.png"
                        className="absolute w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-sm -rotate-[8deg] z-10 pointer-events-none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.95 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.05 }}
                        draggable={false}
                      />
                    )}
                  </AnimatePresence>

                  {/* Sauce (z-index 20) - Top Layer (Sauce on Top) */}
                  <AnimatePresence>
                    {placedIngredients.sauce && (
                      <motion.img
                        src="/images/tortilla/sauce_2.png"
                        className="absolute w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-sm z-20 pointer-events-none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.95 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                        draggable={false}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Assembly Completion Button */}
              <div className="h-16 mt-4 flex items-center justify-center w-full">
                <AnimatePresence>
                  {placedIngredients.chicken && placedIngredients.lettuce && placedIngredients.sauce && (
                    <motion.button
                      type="button"
                      onClick={() => setGamePhase('folding')}
                      className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#D4A373] to-[#8C6239] text-white font-extrabold text-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
                      style={{ fontFamily: "'Itim', cursive" }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{
                        scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                        opacity: { duration: 0.3 },
                      }}
                    >
                      🌯 พับแป้งกันเลย!
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE 4: 2-STEP FOLDING (UNMOUNT OLD BASE & NO clipPath) ─── */}
          {gamePhase === 'folding' && (
            <motion.div
              key="folding"
              className="flex flex-col items-center gap-6 w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <h2
                className="text-3xl font-extrabold text-[#7F4E29] drop-shadow-sm text-center"
                style={{ fontFamily: "'Itim', cursive" }}
              >
                {folded.left && folded.right ? '✨ พับเรียบร้อย' : '🌯 พับแป้ง 2 จังหวะ'}
              </h2>

              <p
                className="text-sm text-[#B08968] font-medium text-center"
                style={{ fontFamily: "'Mali', cursive" }}
              >
                {folded.left && folded.right ? 'กำลังห่ออาหารสมบูรณ์...' : 'แตะพื้นที่แผ่นแป้งฝั่งซ้ายและขวาเพื่อพับเข้าหากัน'}
              </p>

              {/* Scaled-up Tortilla folding board (w-80 h-80 / sm:w-[400px] sm:h-[400px]) */}
              <div className="relative w-80 h-80 sm:w-[400px] sm:h-[400px] select-none mt-2 flex items-center justify-center">
                {/* Visual grid dividing lines (dashed hints) */}
                <div className="absolute inset-0 flex pointer-events-none z-40">
                  <div className="w-1/2 h-full border-r border-dashed border-[#B08968]/20" />
                </div>

                {/* Main Scaled Tortilla Wrapper */}
                <div className="relative w-full h-full flex items-center justify-center p-1">

                  {/* --- OLD BASE & FILLINGS (Only rendered if NOT folded at all) --- */}
                  {!folded.left && !folded.right && (
                    <>
                      {/* Base Tortilla Dough (z-0) */}
                      <img
                        src="/images/tortilla/tortilla.png"
                        alt="Tortilla Base"
                        className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none"
                        draggable={false}
                      />

                      {/* Cooked fillings inside Tortilla (Lettuce & Chicken at z-10, Sauce at z-20) */}
                      <img
                        src="/images/tortilla/lettuce.png"
                        className="absolute w-44 h-44 sm:w-52 sm:h-52 object-contain rotate-[12deg] opacity-90 z-10 pointer-events-none"
                        draggable={false}
                      />
                      <img
                        src="/images/tortilla/chicken_2.png"
                        className="absolute w-36 h-36 sm:w-44 sm:h-44 object-contain -rotate-[8deg] opacity-90 z-10 pointer-events-none"
                        draggable={false}
                      />
                      <img
                        src="/images/tortilla/sauce_2.png"
                        className="absolute w-36 h-36 sm:w-44 sm:h-44 object-contain opacity-90 z-20 pointer-events-none"
                        draggable={false}
                      />
                    </>
                  )}

                  {/* --- LEFT FLAP FOLD (Z-Index 30) --- */}
                  <AnimatePresence>
                    {folded.left && (
                      <motion.img
                        key="left-fold"
                        src="/images/tortilla/left.png"
                        className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        draggable={false}
                      />
                    )}
                  </AnimatePresence>

                  {/* --- RIGHT FLAP FOLD (Z-Index 30) --- */}
                  <AnimatePresence>
                    {folded.right && (
                      <motion.img
                        key="right-fold"
                        src="/images/tortilla/right.png"
                        className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        draggable={false}
                      />
                    )}
                  </AnimatePresence>

                  {/* Interactive Left Side click zone (z-50) */}
                  {!folded.left && (
                    <button
                      type="button"
                      onClick={() => handleFoldClick('left')}
                      className="absolute left-0 top-0 w-1/2 h-full z-50 cursor-pointer flex items-center justify-center group focus:outline-none bg-transparent active:bg-amber-500/10 rounded-l-full"
                    >
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm border border-[#D4A373] text-[#7F4E29] rounded-2xl px-3 py-1.5 shadow-md text-xs font-bold pointer-events-none flex items-center gap-1 transition-opacity duration-200"
                        style={{ fontFamily: "'Mali', cursive" }}
                      >
                        👈 พับฝั่งซ้าย
                      </motion.div>
                    </button>
                  )}

                  {/* Interactive Right Side click zone (z-50) */}
                  {!folded.right && (
                    <button
                      type="button"
                      onClick={() => handleFoldClick('right')}
                      className="absolute right-0 top-0 w-1/2 h-full z-50 cursor-pointer flex items-center justify-center group focus:outline-none bg-transparent active:bg-amber-500/10 rounded-r-full"
                    >
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm border border-[#D4A373] text-[#7F4E29] rounded-2xl px-3 py-1.5 shadow-md text-xs font-bold pointer-events-none flex items-center gap-1 transition-opacity duration-200"
                        style={{ fontFamily: "'Mali', cursive" }}
                      >
                        พับฝั่งขวา 👉
                      </motion.div>
                    </button>
                  )}
                </div>
              </div>

              {/* Fold progress tags */}
              <div className="flex gap-4" style={{ fontFamily: "'Mali', cursive" }}>
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${folded.left ? 'bg-green-150 border border-green-200 text-green-700' : 'bg-white border border-[#D4A373]/30 text-[#B08968]'
                    }`}
                >
                  <span>ซ้าย:</span>
                  <span>{folded.left ? 'พับแล้ว ✓' : 'ยังไม่พับ'}</span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${folded.right ? 'bg-green-150 border border-green-200 text-green-700' : 'bg-white border border-[#D4A373]/30 text-[#B08968]'
                    }`}
                >
                  <span>ขวา:</span>
                  <span>{folded.right ? 'พับแล้ว ✓' : 'ยังไม่พับ'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE 5: SUCCESS CELEBRATION (90vw SIZING) ─── */}
          {gamePhase === 'success' && (
            <motion.div
              key="success"
              className="flex flex-col items-center justify-center gap-6 w-full h-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Completed Tortilla Bounce & Pulse Visual (Scaled up to 90vw on mobile, max 500px) */}
              <motion.div
                className="relative w-[90vw] h-[90vw] max-w-[500px] max-h-[500px] sm:w-[500px] sm:h-[500px]"
                animate={{
                  y: [0, -40, 0, -20, 0, -8, 0],
                  scale: [1, 1.05, 0.98, 1.02, 1],
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <img
                  src="/images/tortilla/tortilla_complete.png"
                  alt="Folded Tortilla Complete"
                  className="w-full h-full object-contain drop-shadow-2xl z-0"
                  draggable={false}
                />
              </motion.div>

              <div className="text-center flex flex-col gap-2">
                <h2
                  className="text-4xl font-extrabold text-[#7F4E29] tracking-wider"
                  style={{ fontFamily: "'Itim', cursive" }}
                >
                  ✨ พับเรียบร้อย!
                </h2>
                <p
                  className="text-base text-[#B08968] font-bold"
                  style={{ fontFamily: "'Mali', cursive" }}
                >
                  ตอติญ่าแสนอร่อยพร้อมเสิร์ฟแล้วจ้า 🎉
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default TortillaGame;
