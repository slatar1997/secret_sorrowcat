import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketSceneProps {
  onSetPassengerName: (name: string) => void;
  onComplete: () => void;
}

// Barcode stripe widths to simulate a real barcode pattern
const BARCODE_WIDTHS: string[] = [
  'w-0.5', 'w-1', 'w-0.5', 'w-1.5', 'w-0.5', 'w-1', 'w-1.5',
  'w-0.5', 'w-1', 'w-0.5', 'w-0.5', 'w-1.5', 'w-1', 'w-0.5',
  'w-1', 'w-0.5', 'w-1.5', 'w-0.5', 'w-1', 'w-0.5', 'w-1',
  'w-0.5', 'w-1.5', 'w-0.5', 'w-0.5', 'w-1', 'w-1.5', 'w-0.5',
];

function TicketScene({ onSetPassengerName, onComplete }: TicketSceneProps) {
  const [name, setName] = useState<string>('');
  const [showTicket, setShowTicket] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [confirmedName, setConfirmedName] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleIssueTicket = useCallback(() => {
    if (name.trim().length === 0) return;

    const trimmedName = name.trim();
    setConfirmedName(trimmedName);
    onSetPassengerName(trimmedName);

    // Play ticket-print sound
    try {
      const audio = new Audio('/sounds/ticket-print.mp3');
      audioRef.current = audio;
      audio.volume = 0.7;
      audio.play().catch(() => {
        // Silently handle autoplay restriction
      });
    } catch {
      // Audio not available
    }

    setShowTicket(true);
  }, [name, onSetPassengerName]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // ─── Phase 1: Name Input ─────────────────────────────────
  if (!showTicket) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4"
        style={{ backgroundColor: '#FFF0F5' }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-3xl sm:text-4xl font-bold text-pink-400"
            style={{ fontFamily: "'Itim', cursive" }}
          >
            🎫ตั๋วรถไฟ
          </h1>
          <p
            className="text-sm text-pink-300 opacity-80"
            style={{ fontFamily: "'Mali', cursive" }}
          >
            พิมพ์ชื่อผู้โดยสารลงไปเลยนะ
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4 w-full max-w-xs"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <input
            id="passenger-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleIssueTicket();
            }}
            placeholder="ชื่อผู้โดยสาร..."
            className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-white/80 text-center text-lg text-gray-700 placeholder-pink-200 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all duration-200"
            style={{ fontFamily: "'Mali', cursive" }}
            autoFocus
            maxLength={30}
          />

          <motion.button
            id="issue-ticket-btn"
            type="button"
            onClick={handleIssueTicket}
            disabled={name.trim().length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-300 to-orange-200 text-white font-bold text-lg shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95"
            style={{ fontFamily: "'Itim', cursive" }}
            whileTap={{ scale: 0.95 }}
          >
            ซื้อตั๋ว
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Phase 2: Ticket Card ────────────────────────────────
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4 overflow-hidden"
      style={{ backgroundColor: '#FFF0F5' }}
    >
      {/* Ticket slide-up container */}
      <motion.div
        className="w-full max-w-lg cursor-pointer"
        initial={{ y: '100vh' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 80, duration: 1.2 }}
        style={{ perspective: '1200px' }}
        onClick={handleFlip}
      >
        {/* 3D flip wrapper */}
        <motion.div
          className="relative w-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ═══ FRONT SIDE ═══ */}
          <div
            className="w-full rounded-2xl border-2 border-[#FFA07A] bg-[#FDFBF7] shadow-xl overflow-hidden relative"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Punch holes — left */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFF0F5] border-2 border-[#FFA07A] z-10" />
            {/* Punch holes — right */}
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFF0F5] border-2 border-[#FFA07A] z-10" />

            <div className="flex min-h-[200px] sm:min-h-[220px]">
              {/* ── Main Area (70%) ── */}
              <div className="flex-[7] flex flex-col justify-between p-4 sm:p-5 relative">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Underground logo circle */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] border-red-500 flex items-center justify-center relative shrink-0">
                    <div className="w-full h-[3px] bg-red-500 absolute" />
                    <span
                      className="text-[6px] sm:text-[7px] font-bold text-white bg-red-500 px-1 relative z-10 leading-none"
                      style={{ fontFamily: "'Itim', cursive" }}
                    >
                      LDN
                    </span>
                  </div>
                  <h2
                    className="text-base sm:text-lg font-bold text-[#8B4513] tracking-wide"
                    style={{ fontFamily: "'Itim', cursive" }}
                  >
                    LONDON TRANSIT
                  </h2>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-[#B8860B] font-semibold uppercase text-[10px] sm:text-xs tracking-wider">Name</span>
                    <p
                      className="font-bold text-[#5C3317] text-sm sm:text-base truncate"
                      style={{ fontFamily: "'Mali', cursive" }}
                    >
                      {confirmedName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#B8860B] font-semibold uppercase text-[10px] sm:text-xs tracking-wider">Destination</span>
                    <p
                      className="font-bold text-[#5C3317] text-sm sm:text-base"
                      style={{ fontFamily: "'Mali', cursive" }}
                    >
                      Together
                    </p>
                  </div>
                  <div>
                    <span className="text-[#B8860B] font-semibold uppercase text-[10px] sm:text-xs tracking-wider">Start Date</span>
                    <p
                      className="font-bold text-[#5C3317] text-sm sm:text-base"
                      style={{ fontFamily: "'Mali', cursive" }}
                    >
                      19 June 2026
                    </p>
                  </div>
                  <div>
                    <span className="text-[#B8860B] font-semibold uppercase text-[10px] sm:text-xs tracking-wider">Valid Until</span>
                    <p
                      className="font-bold text-[#5C3317] text-sm sm:text-base"
                      style={{ fontFamily: "'Mali', cursive" }}
                    >
                      No expired
                    </p>
                  </div>
                </div>

                {/* Footer watermark */}
                <p
                  className="text-[#D2B48C] text-lg sm:text-xl font-bold opacity-20 mt-2 select-none"
                  style={{ fontFamily: "'Itim', cursive" }}
                >
                  Love Express
                </p>
              </div>

              {/* ── Dashed divider ── */}
              <div className="w-0 border-l-2 border-dashed border-[#C8A882] self-stretch my-2" />

              {/* ── Stub Area (30%) ── */}
              <div className="flex-[3] flex flex-col items-center justify-between p-3 sm:p-4">
                {/* Class badge */}
                <div className="bg-[#FFA07A] rounded-lg px-3 py-1 mb-2">
                  <span
                    className="text-white font-bold text-sm sm:text-base tracking-widest"
                    style={{ fontFamily: "'Itim', cursive" }}
                  >
                    1ST
                  </span>
                </div>

                {/* Stub info */}
                <div className="flex flex-col items-center gap-1 text-[10px] sm:text-xs text-[#8B7355]">
                  <div className="text-center">
                    <span className="uppercase tracking-wider font-semibold text-[9px]">Seat</span>
                    <p className="font-bold text-[#5C3317]" style={{ fontFamily: "'Mali', cursive" }}>Heart</p>
                  </div>
                  <div className="text-center">
                    <span className="uppercase tracking-wider font-semibold text-[9px]">Time</span>
                    <p className="font-bold text-[#5C3317]" style={{ fontFamily: "'Mali', cursive" }}>20.26</p>
                  </div>
                  <div className="text-center">
                    <span className="uppercase tracking-wider font-semibold text-[9px]">Number</span>
                    <p className="font-bold text-[#5C3317]" style={{ fontFamily: "'Mali', cursive" }}>190626</p>
                  </div>
                </div>

                {/* Barcode */}
                <div className="flex items-end gap-px mt-2 h-6 sm:h-8">
                  {BARCODE_WIDTHS.map((w, i) => (
                    <div
                      key={i}
                      className={`${w} h-full bg-[#3C2415] rounded-[0.5px]`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ BACK SIDE ═══ */}
          <div
            className="absolute inset-0 w-full rounded-2xl border-2 border-[#FFA07A] bg-[#FDFBF7] shadow-xl flex items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Punch holes — left */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFF0F5] border-2 border-[#FFA07A] z-10" />
            {/* Punch holes — right */}
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FFF0F5] border-2 border-[#FFA07A] z-10" />

            <p
              className="text-2xl sm:text-3xl font-bold text-[#C8A882] italic"
              style={{ fontFamily: "'Mali', cursive" }}
            >
              Love Express:Special Ticket
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Flip hint */}
      <AnimatePresence>
        {!isFlipped && (
          <motion.p
            className="text-xs text-pink-300 opacity-60"
            style={{ fontFamily: "'Mali', cursive" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            แตะตั๋วเพื่อพลิกดูด้านหลัง ✨
          </motion.p>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <motion.button
        id="ticket-continue-btn"
        type="button"
        onClick={onComplete}
        className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-pink-300 to-orange-200 text-white font-bold text-base shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95"
        style={{ fontFamily: "'Itim', cursive" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
        whileTap={{ scale: 0.95 }}
      >
        ต่อไป 🚂
      </motion.button>
    </div>
  );
}

export default TicketScene;
