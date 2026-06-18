import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LondonSceneProps {
  onComplete: () => void;
}

// London view images in narrative order
const LONDON_IMAGES: string[] = [
  '/images/london/london-1.jpg',
  '/images/london/london-2.jpg',
  '/images/london/london-3.jpg',
];

// Total sliding duration in seconds (cinematic feel)
const SLIDE_DURATION = 15;
// Pause at the end before transitioning (seconds)
const END_PAUSE = 1;
// Fade-out transition duration (seconds)
const FADE_DURATION = 1.2;

function LondonScene({ onComplete }: LondonSceneProps) {
  const [isSlideDone, setIsSlideDone] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Play train sound on mount and handle cleanup
  useEffect(() => {
    const audio = new Audio('/sounds/Train.mp3');
    audio.loop = true;
    audio.play().catch((err) => {
      console.warn('Audio auto-play failed:', err);
    });
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Called by Framer Motion when the sliding animation finishes (end of image 3)
  const handleSlideComplete = useCallback(() => {
    setIsSlideDone(true);

    // Stop the train sound right when the slide animation ends (image 3 completes)
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Pause briefly to let the viewer absorb the final image, then fade out
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(true);
    }, END_PAUSE * 1000);
  }, []);

  // Called when the fade-out transition finishes → move to desktop phase
  const handleFadeComplete = useCallback(() => {
    if (isTransitioning) {
      onComplete();
    }
  }, [isTransitioning, onComplete]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#1a1a2e]">
      {/* ── Train cabin background layer ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d2d44] via-[#1a1a2e] to-[#0f0f1e] z-0" />

      {/* ── Cabin interior frame details ── */}
      {/* Top rail */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-[#3d3426] to-[#2a2318] z-20" />
      {/* Bottom rail */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-t from-[#3d3426] to-[#2a2318] z-20" />
      {/* Left wall */}
      <div className="absolute top-0 bottom-0 left-0 w-6 sm:w-10 bg-[#2a2318] z-20" />
      {/* Right wall */}
      <div className="absolute top-0 bottom-0 right-0 w-6 sm:w-10 bg-[#2a2318] z-20" />

      {/* ── Window frame (static mask) ── */}
      <div className="relative z-10 w-[85vw] max-w-2xl aspect-[16/9] rounded-2xl overflow-hidden border-4 border-[#5a4a38] shadow-[inset_0_0_30px_rgba(0,0,0,0.5),0_0_40px_rgba(0,0,0,0.6)]">
        {/* Inner border glow */}
        <div className="absolute inset-0 rounded-2xl border-2 border-[#8B7355]/30 z-30 pointer-events-none" />

        {/* ── Sliding image strip (moving container) ── */}
        <motion.div
          className="absolute top-0 left-0 h-full flex"
          /* 
           * Width = 3 images × 100% of the window = 300%.
           * Slide from x=0 to x=-200% (the last image centered).
           */
          style={{ width: '300%' }}
          initial={{ x: '0%' }}
          animate={{ x: '-66.667%' }}
          transition={{
            duration: SLIDE_DURATION,
            ease: 'linear',
          }}
          onAnimationComplete={handleSlideComplete}
        >
          {LONDON_IMAGES.map((src, idx) => (
            <div key={idx} className="relative h-full" style={{ width: '33.333%' }}>
              <img
                src={src}
                alt={`London view ${idx + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Soft vignette overlay on each image */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
            </div>
          ))}
        </motion.div>

        {/* Window reflection glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent z-20 pointer-events-none" />
      </div>

      {/* ── Window sill detail ── */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-[88vw] max-w-[700px] h-3 bg-[#5a4a38] rounded-b-sm z-20 shadow-md" />

      {/* ── "Arriving" text hint ── */}
      {isSlideDone && !isTransitioning && (
        <motion.p
          className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 text-sm text-amber-200/60 z-30"
          style={{ fontFamily: "'Mali', cursive" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          กำลังถึงสถานี... 🚂
        </motion.p>
      )}

      {/* ── Transition overlay: Fade + Blur + White flash ── */}
      <motion.div
        className="absolute inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={
          isTransitioning
            ? { opacity: 1 }
            : { opacity: 0 }
        }
        transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
        onAnimationComplete={handleFadeComplete}
        style={{ backgroundColor: '#FFFAF0' }}
      />

      {/* Blur overlay — separate layer so blur animates independently */}
      <motion.div
        className="absolute inset-0 z-40 pointer-events-none"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={
          isTransitioning
            ? { opacity: 1, backdropFilter: 'blur(12px)' }
            : { opacity: 0, backdropFilter: 'blur(0px)' }
        }
        transition={{ duration: FADE_DURATION * 0.8, ease: 'easeIn' }}
      />
    </div>
  );
}

export default LondonScene;
