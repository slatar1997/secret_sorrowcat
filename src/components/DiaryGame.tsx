import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import HTMLFlipBook from 'react-pageflip';
import { forwardRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────
interface DiaryGameProps {
  onDiaryRead: () => void;
  onBackToDesk: () => void;
}

interface PhotoEntry {
  src: string;
  caption: string;
}

interface PageProps {
  photos: PhotoEntry[];
  pageNumber: number;
}

interface FlipBookRef {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
  };
}

// ─── Photo Data (20 photos, 4 per page across 5 pages) ─────────────
const ALL_PHOTOS: PhotoEntry[] = [
  { src: '/images/diary/photo-01.png', caption: 'ความทรงจำที่ 1 💕' },
  { src: '/images/diary/photo-02.png', caption: 'ความทรงจำที่ 2 🌸' },
  { src: '/images/diary/photo-03.png', caption: 'ความทรงจำที่ 3 ✨' },
  { src: '/images/diary/photo-04.png', caption: 'ความทรงจำที่ 4 🎀' },
  { src: '/images/diary/photo-05.png', caption: 'ความทรงจำที่ 5 🌷' },
  { src: '/images/diary/photo-06.png', caption: 'ความทรงจำที่ 6 💫' },
  { src: '/images/diary/photo-07.png', caption: 'ความทรงจำที่ 7 🦋' },
  { src: '/images/diary/photo-08.png', caption: 'ความทรงจำที่ 8 🌈' },
  { src: '/images/diary/photo-09.png', caption: 'ความทรงจำที่ 9 🍰' },
  { src: '/images/diary/photo-10.png', caption: 'ความทรงจำที่ 10 🎵' },
  { src: '/images/diary/photo-11.png', caption: 'ความทรงจำที่ 11 🌻' },
  { src: '/images/diary/photo-12.png', caption: 'ความทรงจำที่ 12 💝' },
  { src: '/images/diary/photo-13.png', caption: 'ความทรงจำที่ 13 🌟' },
  { src: '/images/diary/photo-14.png', caption: 'ความทรงจำที่ 14 🎶' },
  { src: '/images/diary/photo-15.png', caption: 'ความทรงจำที่ 15 💐' },
  { src: '/images/diary/photo-16.png', caption: 'ความทรงจำที่ 16 🧸' },
  { src: '/images/diary/photo-17.png', caption: 'ความทรงจำที่ 17 🎈' },
  { src: '/images/diary/photo-18.png', caption: 'ความทรงจำที่ 18 🌺' },
  { src: '/images/diary/cover-19.png', caption: 'ความทรงจำที่ 19 💖' },
  { src: '/images/diary/photo-20.jpg', caption: 'ความทรงจำที่ 20 🥰' },
];

// Slice photos into pages of 4
const PAGES: PhotoEntry[][] = Array.from({ length: 5 }, (_, i) =>
  ALL_PHOTOS.slice(i * 4, i * 4 + 4)
);

const TOTAL_PAGES = PAGES.length;

// ─── Polaroid Card Component ────────────────────────────────────────
function PolaroidCard({ photo }: { photo: PhotoEntry }) {
  return (
    <div className="flex flex-col bg-[#FFFDF7] rounded-md shadow-md overflow-hidden">
      <div className="p-3.5 pb-0">
        <div className="aspect-square overflow-hidden rounded-sm">
          <img
            src={photo.src}
            alt={photo.caption}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      </div>
      <p
        className="text-sm sm:text-base md:text-lg text-[#6B5B4F] text-center py-3 px-2 leading-tight font-medium"
        style={{ fontFamily: "'Mali', cursive" }}
      >
        {photo.caption}
      </p>
    </div>
  );
}

// ─── Page Component (forwardRef required by react-pageflip) ─────────
const DiaryPage = forwardRef<HTMLDivElement, PageProps>(
  function DiaryPage({ photos, pageNumber }, ref) {
    return (
      <div
        ref={ref}
        className="w-full h-full bg-[#FFF8F0] flex flex-col rounded-sm overflow-hidden"
      >
        {/* Page header */}
        <div className="pt-6 pb-3 px-10 flex items-center justify-between">
          <div className="w-16 h-0.5 bg-[#D4C4B0] rounded-full" />
          <p
            className="text-sm sm:text-base md:text-lg text-[#B8A99A]"
            style={{ fontFamily: "'Mali', cursive" }}
          >
            หน้า {pageNumber}
          </p>
          <div className="w-16 h-0.5 bg-[#D4C4B0] rounded-full" />
        </div>

        {/* Photo grid 2×2 */}
        <div className="flex-1 grid grid-cols-2 gap-4 sm:gap-6 p-6 sm:p-8">
          {photos.map((photo, idx) => (
            <PolaroidCard key={idx} photo={photo} />
          ))}
        </div>

        {/* Page footer ornament */}
        <div className="flex justify-center pb-5">
          <div className="flex items-center gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#D4C4B0]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

// ─── Main Diary Component ───────────────────────────────────────────
function DiaryGame({ onDiaryRead, onBackToDesk }: DiaryGameProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasReadAll, setHasReadAll] = useState<boolean>(false);
  const flipBookRef = useRef<FlipBookRef | null>(null);

  const handleFlipNext = useCallback(() => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  }, []);

  const handleFlipPrev = useCallback(() => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  }, []);

  const handlePageFlip = useCallback(
    (e: { data: number }) => {
      const newPage = e.data;
      setCurrentPage(newPage);

      // Mark diary as read when user reaches the last page
      if (newPage >= TOTAL_PAGES - 1 && !hasReadAll) {
        setHasReadAll(true);
        onDiaryRead();
      }
    },
    [hasReadAll, onDiaryRead]
  );

  return (
    <motion.div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Background: warm desk texture ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D2B48C] via-[#C4A882] to-[#B89B72] z-0" />
      <div
        className="absolute inset-0 opacity-10 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(139,115,85,0.3) 50px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* ── Back button ── */}
      <motion.button
        type="button"
        className="absolute top-4 left-4 z-50 px-4 py-2 rounded-xl bg-white/30 border border-white/40 text-[#5C4A3A] font-bold cursor-pointer hover:bg-white/50 transition-colors shadow-md backdrop-blur-sm"
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
        className="relative z-10 mb-4 text-2xl sm:text-3xl font-bold text-[#5C4A3A] drop-shadow-sm"
        style={{ fontFamily: "'Itim', cursive" }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        📖 สมุดความทรงจำ
      </motion.h1>

      {/* ── Book Container ── */}
      <motion.div
        className="relative z-10 flex items-center gap-2 sm:gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* Prev button */}
        <motion.button
          type="button"
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer select-none transition-colors duration-200 ${
            currentPage > 0
              ? 'bg-[#E8D5C4] hover:bg-[#DCC8B5] text-[#7A6455]'
              : 'bg-[#E8D5C4]/40 text-[#B8A99A] cursor-not-allowed'
          }`}
          whileHover={currentPage > 0 ? { scale: 1.1 } : {}}
          whileTap={currentPage > 0 ? { scale: 0.85 } : {}}
          onClick={handleFlipPrev}
          disabled={currentPage <= 0}
        >
          <span className="text-lg font-bold">‹</span>
        </motion.button>

        {/* Book */}
        <div className="shadow-2xl rounded-lg overflow-hidden border-2 border-[#B89B72]/50 w-[85vw] max-w-[640px] aspect-[3/4]">
          {/* @ts-expect-error react-pageflip types incomplete for React 19 */}
          <HTMLFlipBook
            ref={flipBookRef}
            width={600}
            height={800}
            size="stretch"
            minWidth={320}
            maxWidth={760}
            minHeight={420}
            maxHeight={980}
            showCover={false}
            mobileScrollSupport={false}
            onFlip={handlePageFlip}
            className="diary-flipbook"
            flippingTime={800}
            usePortrait={true}
            startPage={0}
            drawShadow={true}
            maxShadowOpacity={0.3}
            useMouseEvents={true}
            swipeDistance={30}
            clickEventForward={false}
            startZIndex={0}
            autoSize={true}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {PAGES.map((pagePhotos, idx) => (
              <DiaryPage
                key={idx}
                photos={pagePhotos}
                pageNumber={idx + 1}
              />
            ))}
          </HTMLFlipBook>
        </div>

        {/* Next button */}
        <motion.button
          type="button"
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer select-none transition-colors duration-200 ${
            currentPage < TOTAL_PAGES - 1
              ? 'bg-[#E8D5C4] hover:bg-[#DCC8B5] text-[#7A6455]'
              : 'bg-[#E8D5C4]/40 text-[#B8A99A] cursor-not-allowed'
          }`}
          whileHover={currentPage < TOTAL_PAGES - 1 ? { scale: 1.1 } : {}}
          whileTap={currentPage < TOTAL_PAGES - 1 ? { scale: 0.85 } : {}}
          onClick={handleFlipNext}
          disabled={currentPage >= TOTAL_PAGES - 1}
        >
          <span className="text-lg font-bold">›</span>
        </motion.button>
      </motion.div>

      {/* ── Page indicator ── */}
      <motion.div
        className="relative z-10 mt-4 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentPage
                ? 'bg-[#7A6455] scale-125'
                : 'bg-[#C4B5A5]'
            }`}
          />
        ))}
      </motion.div>

      <motion.p
        className="relative z-10 mt-2 text-xs text-[#8B7B6B]"
        style={{ fontFamily: "'Mali', cursive" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        ปัดหรือกดลูกศรเพื่อพลิกหน้า ({currentPage + 1}/{TOTAL_PAGES})
      </motion.p>

      {/* ── Read complete badge ── */}
      {hasReadAll && (
        <motion.div
          className="relative z-10 mt-3 px-4 py-1.5 rounded-full bg-green-100 border border-green-300 text-green-700 text-xs"
          style={{ fontFamily: "'Mali', cursive" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✅ อ่านครบทุกหน้าแล้ว!
        </motion.div>
      )}
    </motion.div>
  );
}

// Export photo paths for Grand Finale usage (Global Asset Export requirement)
export const DIARY_PHOTO_PATHS: string[] = ALL_PHOTOS.map((p) => p.src);

export default DiaryGame;
