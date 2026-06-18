import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useGlobalAudio } from '../contexts/AudioContext';

// ─── Types ──────────────────────────────────────────────────────────
interface VinylGameProps {
  onVinylPlayed: () => void;
  onBackToDesk: () => void;
}

interface VinylDisc {
  id: number;
  coverSrc: string;
  title?: string;
}

// ─── Constants ──────────────────────────────────────────────────────
const VINYL_DISCS: VinylDisc[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  coverSrc: `/images/vinyl/cover-${String(i + 1).padStart(2, '0')}.png`,
}));

// ─── Component ──────────────────────────────────────────────────────
function VinylGame({ onVinylPlayed, onBackToDesk }: VinylGameProps) {
  const {
    activeVinylId,
    isPlaying,
    playVinyl,
    resume,
    pause,
    stop,
    currentTime,
    duration,
    seek,
  } = useGlobalAudio();

  // Format seconds to MM:SS
  const formatTime = useCallback((time: number): string => {
    if (isNaN(time) || !isFinite(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Drop-zone proximity highlight
  const [isNearDropZone, setIsNearDropZone] = useState<boolean>(false);
  const turntableRef = useRef<HTMLDivElement>(null);

  // Track which disc is animating into the player (for click-to-swap)
  const [swappingDiscId, setSwappingDiscId] = useState<number | null>(null);

  // ── Drag end handler ──
  const handleDragEnd = useCallback(
    (discId: number, _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsNearDropZone(false);

      if (!turntableRef.current) return;
      const rect = turntableRef.current.getBoundingClientRect();
      const dropX = info.point.x;
      const dropY = info.point.y;

      const isInside =
        dropX >= rect.left &&
        dropX <= rect.right &&
        dropY >= rect.top &&
        dropY <= rect.bottom;

      if (isInside) {
        playVinyl(discId);
        onVinylPlayed();
      }
    },
    [playVinyl, onVinylPlayed]
  );

  // ── Drag handler for proximity detection ──
  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!turntableRef.current) return;
      const rect = turntableRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((info.point.x - cx) ** 2 + (info.point.y - cy) ** 2);
      setIsNearDropZone(dist < rect.width * 0.8);
    },
    []
  );

  // ── Click-to-swap handler ──
  const handleClickSwap = useCallback(
    (discId: number) => {
      if (discId === activeVinylId) return;
      setSwappingDiscId(discId);
      // Small delay to let the swap animation play
      setTimeout(() => {
        playVinyl(discId);
        onVinylPlayed();
        setSwappingDiscId(null);
      }, 300);
    },
    [activeVinylId, playVinyl, onVinylPlayed]
  );

  // ── Current active disc info ──
  const activeDisc = VINYL_DISCS.find((d) => d.id === activeVinylId) ?? null;

  // ── Tone arm rotation (degrees) ──
  const toneArmRotation = isPlaying ? 28 : activeVinylId !== null && !isPlaying ? 28 : 0;
  // When stopped (via stop button), tone arm goes back to 0 — handled by checking activeVinylId + isPlaying

  return (
    <motion.div
      className="relative min-h-screen w-full flex flex-col items-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] z-0" />
      <div className="absolute inset-0 opacity-5 z-0 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* ── Back button ── */}
      <motion.button
        type="button"
        className="absolute top-4 left-4 z-50 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/80 font-bold cursor-pointer hover:bg-white/20 transition-colors shadow-md backdrop-blur-sm"
        style={{ fontFamily: "'Itim', cursive" }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBackToDesk}
      >
        ← กลับโต๊ะ
      </motion.button>

      {/* ── Title ── */}
      <motion.h1
        className="relative z-10 mt-6 text-2xl sm:text-3xl font-bold text-white/90 drop-shadow-lg"
        style={{ fontFamily: "'Itim', cursive" }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        🎶 เครื่องเล่นแผ่นเสียง
      </motion.h1>

      {/* ── Main content area ── */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-16 mt-6 w-full max-w-5xl px-6 flex-1 pb-8">
        
        {/* ── Left Column: Turntable & Controls ── */}
        <div className="flex flex-col items-center gap-6 flex-shrink-0">
          {/* ════ Turntable ════ */}
          <div
            ref={turntableRef}
            className="relative w-80 h-80 md:w-[400px] md:h-[400px]"
          >
            {/* Turntable base (brown wood) */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5C3317] via-[#6B3A1F] to-[#4A2810] shadow-2xl border border-[#7a4a2d]/50" />

            {/* Drop zone glow when near */}
            <AnimatePresence>
              {isNearDropZone && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-amber-400/60 pointer-events-none z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, boxShadow: '0 0 30px rgba(251,191,36,0.3)' }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            {/* ── Vinyl platter area ── */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] shadow-inner flex items-center justify-center overflow-hidden">
              {/* Vinyl grooves */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[20, 30, 40, 50, 60, 70, 80].map((pct) => (
                  <div
                    key={pct}
                    className="absolute rounded-full border border-white/5"
                    style={{ width: `${pct}%`, height: `${pct}%` }}
                  />
                ))}
              </div>

              {/* Spinning vinyl disc + cover */}
              {activeDisc && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={
                    isPlaying
                      ? { duration: 3, ease: 'linear', repeat: Infinity }
                      : { duration: 0 }
                  }
                >
                  {/* Black vinyl disc */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#111] shadow-inner" />

                  {/* Cover image at center (locked aspect ratio, circular) */}
                  <div className="absolute top-1/2 left-1/2 w-[45%] h-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-lg border-2 border-white/10">
                    <img
                      src={activeDisc.coverSrc}
                      alt={`Cover ${activeDisc.id}`}
                      className="w-full h-full object-cover rounded-full"
                      draggable={false}
                    />
                  </div>

                  {/* Center spindle dot */}
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ccc] shadow-md z-10" />
                </motion.div>
              )}

              {/* Empty state hint */}
              {!activeDisc && (
                <motion.p
                  className="text-white/30 text-xs text-center px-4 z-10"
                  style={{ fontFamily: "'Mali', cursive" }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ลากแผ่นเสียงมาวางที่นี่
                </motion.p>
              )}
            </div>

            {/* ── Tone arm ── */}
            <motion.div
              className="absolute -top-1 -right-1 z-30 origin-top-right"
              animate={{ rotate: toneArmRotation }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {/* Arm pivot */}
              <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#888] shadow-md z-10" />
              {/* Arm body */}
              <div
                className="absolute top-2 right-1.5 w-1.5 bg-gradient-to-b from-[#aaa] to-[#777] rounded-full shadow-sm h-[170px] md:h-[215px]"
                style={{ transformOrigin: 'top center' }}
              />
              {/* Needle head */}
              <div
                className="absolute right-0.5 w-3 h-3 rounded-full bg-[#d4a574] shadow-sm top-[172px] md:top-[217px]"
              />
            </motion.div>
          </div>

          {/* ════ Progress Bar ════ */}
          <div className="w-80 md:w-[400px] flex flex-col gap-1.5 px-2 mt-2">
            <div className="flex items-center justify-between text-xs text-white/50" style={{ fontFamily: "'Mali', cursive" }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative w-full flex items-center group">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  if (activeVinylId !== null) {
                    seek(parseFloat(e.target.value));
                  }
                }}
                disabled={activeVinylId === null}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-amber-400 outline-none transition-all duration-150 ${
                  activeVinylId === null ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/20'
                }`}
                style={{
                  background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${
                    duration ? (currentTime / duration) * 100 : 0
                  }%, rgba(255,255,255,0.1) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
          </div>

          {/* ════ Control Buttons ════ */}
          <div className="flex items-center gap-3">
            {/* Play */}
            <motion.button
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer select-none transition-colors duration-200 ${
                activeVinylId !== null
                  ? 'bg-green-500 hover:bg-green-400 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={activeVinylId !== null ? { scale: 1.1 } : {}}
              whileTap={activeVinylId !== null ? { scale: 0.9 } : {}}
              onClick={() => {
                if (activeVinylId !== null) {
                  resume();
                }
              }}
            >
              <span className="text-lg ml-0.5">▶</span>
            </motion.button>

            {/* Pause */}
            <motion.button
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer select-none transition-colors duration-200 ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-white'
                  : 'bg-gray-600 text-gray-400'
              }`}
              whileHover={isPlaying ? { scale: 1.1 } : {}}
              whileTap={isPlaying ? { scale: 0.9 } : {}}
              onClick={pause}
            >
              <span className="text-lg">⏸</span>
            </motion.button>

            {/* Stop */}
            <motion.button
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer select-none transition-colors duration-200 ${
                activeVinylId !== null
                  ? 'bg-rose-500 hover:bg-rose-400 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={activeVinylId !== null ? { scale: 1.1 } : {}}
              whileTap={activeVinylId !== null ? { scale: 0.9 } : {}}
              onClick={() => {
                if (activeVinylId !== null) {
                  stop();
                }
              }}
            >
              <span className="text-lg">⏹</span>
            </motion.button>
          </div>

          {/* Now playing indicator */}
          <AnimatePresence>
            {activeDisc && (
              <motion.div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <motion.span
                  className="text-sm"
                  animate={isPlaying ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                  transition={isPlaying ? { duration: 1, repeat: Infinity } : {}}
                >
                  🎵
                </motion.span>
                <span
                  className="text-xs text-white/70"
                  style={{ fontFamily: "'Mali', cursive" }}
                >
                  แผ่นที่ {activeDisc.id} {isPlaying ? '— กำลังเล่น' : '— หยุดอยู่'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Column: Vinyl Storage Box ── */}
        <motion.div
          className="w-full md:max-w-md md:mt-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p
            className="text-xs text-white/40 mb-3 text-center md:text-left"
            style={{ fontFamily: "'Mali', cursive" }}
          >
            กล่องแผ่นเสียง — ลากหรือแตะเพื่อเปลี่ยนแผ่น
          </p>

          <div className="grid grid-cols-4 md:grid-cols-3 gap-2 sm:gap-3">
            {VINYL_DISCS.map((disc) => {
              const isActive = disc.id === activeVinylId;
              const isSwapping = disc.id === swappingDiscId;

              return (
                <motion.div
                  key={disc.id}
                  className="relative"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + disc.id * 0.04 }}
                >
                  {/* Slot background (empty when active) */}
                  {isActive && (
                    <div className="aspect-square rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center">
                      <span className="text-white/20 text-xs">🎵</span>
                    </div>
                  )}

                  {/* Draggable disc card */}
                  {!isActive && (
                    <motion.div
                      className={`aspect-square rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing shadow-md select-none ${
                        isSwapping
                          ? 'border-amber-400 shadow-amber-400/30'
                          : 'border-white/15 hover:border-white/30'
                      }`}
                      drag
                      dragSnapToOrigin
                      dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
                      whileTap={{ scale: 0.95 }}
                      whileDrag={{ scale: 1.15, zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                      onDrag={handleDrag}
                      onDragEnd={(event, info) => handleDragEnd(disc.id, event, info)}
                      onClick={() => handleClickSwap(disc.id)}
                      animate={
                        isSwapping
                          ? { scale: [1, 0.8, 0], opacity: [1, 0.8, 0] }
                          : { scale: 1, opacity: 1 }
                      }
                      transition={isSwapping ? { duration: 0.3 } : {}}
                    >
                      <img
                        src={disc.coverSrc}
                        alt={`Vinyl ${disc.id}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />

                      {/* Disc number badge */}
                      <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-[10px] text-white/80 font-bold">
                          {disc.id}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default VinylGame;
