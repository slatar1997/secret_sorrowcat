import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

// ─── Types ──────────────────────────────────────────────────────────
interface AudioContextValue {
  activeVinylId: number | null;
  isPlaying: boolean;
  playVinyl: (id: number) => void;
  resume: () => void;
  pause: () => void;
  stop: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
}

interface AudioProviderProps {
  children: ReactNode;
}

// ─── Song mapping (some IDs may not have files) ─────────────────────
const AVAILABLE_SONGS: Record<number, string> = {
  1: '/sounds/song-1.mp3',
  2: '/sounds/song-2.mp3',
  3: '/sounds/song-3.mp3',
  4: '/sounds/song-4.mp3',
  5: '/sounds/song-5.mp3',
  6: '/sounds/song-6.mp3',
  7: '/sounds/song-7.mp3',
  8: '/sounds/song-8.mp3',
  9: '/sounds/song-9.mp3',
  10: '/sounds/song-10.mp3',
  11: '/sounds/song-11.mp3',
  12: '/sounds/song-12.mp3',
};

// ─── Context ────────────────────────────────────────────────────────
const GlobalAudioContext = createContext<AudioContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────
function AudioProvider({ children }: AudioProviderProps) {
  const [activeVinylId, setActiveVinylId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialise <audio> element and sync standard events
  useEffect(() => {
    const el = new Audio();
    el.preload = 'auto';
    audioRef.current = el;

    const handleTimeUpdate = () => {
      setCurrentTime(el.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(el.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('durationchange', handleDurationChange);
    el.addEventListener('loadedmetadata', handleDurationChange);
    el.addEventListener('ended', handleEnded);

    return () => {
      el.pause();
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('durationchange', handleDurationChange);
      el.removeEventListener('loadedmetadata', handleDurationChange);
      el.removeEventListener('ended', handleEnded);
    };
  }, []);

  const getAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      // Fallback
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }, []);

  /** Load a new song and start playing */
  const playVinyl = useCallback(
    (id: number) => {
      const audio = getAudio();
      const src = AVAILABLE_SONGS[id];

      // If no file for this id, silently skip audio but still set state
      if (!src) {
        audio.pause();
        audio.currentTime = 0;
        setCurrentTime(0);
        setDuration(0);
        setActiveVinylId(id);
        setIsPlaying(false);
        return;
      }

      // If same vinyl, just resume
      if (id === activeVinylId && audio.src.endsWith(src)) {
        audio.play().catch(() => {/* user gesture required */});
        setIsPlaying(true);
        return;
      }

      // Different vinyl → stop old, load new
      audio.pause();
      audio.currentTime = 0;
      setCurrentTime(0);
      setDuration(0);
      audio.src = src;
      audio.load();

      // Short delay for realism (tone arm settling)
      setTimeout(() => {
        audio.play().catch(() => {/* user gesture required */});
        setIsPlaying(true);
      }, 400);

      setActiveVinylId(id);
    },
    [activeVinylId, getAudio]
  );

  /** Resume from paused position */
  const resume = useCallback(() => {
    const audio = getAudio();
    if (activeVinylId !== null && audio.src) {
      audio.play().catch(() => {/* user gesture required */});
      setIsPlaying(true);
    }
  }, [activeVinylId, getAudio]);

  /** Pause at current position (tone arm stays) */
  const pause = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    setIsPlaying(false);
  }, [getAudio]);

  /** Stop completely, reset time to 0 */
  const stop = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, [getAudio]);

  /** Seek to a specific timestamp */
  const seek = useCallback(
    (time: number) => {
      const audio = getAudio();
      audio.currentTime = time;
      setCurrentTime(time);
    },
    [getAudio]
  );

  return (
    <GlobalAudioContext.Provider
      value={{
        activeVinylId,
        isPlaying,
        playVinyl,
        resume,
        pause,
        stop,
        currentTime,
        duration,
        seek,
      }}
    >
      {children}
    </GlobalAudioContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────
function useGlobalAudio(): AudioContextValue {
  const ctx = useContext(GlobalAudioContext);
  if (!ctx) {
    throw new Error('useGlobalAudio must be used within an AudioProvider');
  }
  return ctx;
}

export { AudioProvider, useGlobalAudio };
