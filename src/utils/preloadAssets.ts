// ─── Asset Preloader ────────────────────────────────────────────────
// Silently preloads all game images and audio files into the browser cache
// after the Password Gate is passed. No UI, no errors thrown to the caller.

// ── All image paths used across every scene ──────────────────────────
const ALL_IMAGE_PATHS: string[] = [
  // London Scene
  '/images/london/loading.png',
  '/images/london/london-1.jpg',
  '/images/london/london-2.jpg',
  '/images/london/london-3.jpg',

  // Tortilla Game
  '/images/tortilla/chicken.png',
  '/images/tortilla/chicken_2.png',
  '/images/tortilla/lettuce.png',
  '/images/tortilla/sauce.png',
  '/images/tortilla/sauce_2.png',
  '/images/tortilla/tortilla.png',
  '/images/tortilla/tortilla_complete.png',
  '/images/tortilla/left.png',
  '/images/tortilla/right.png',

  // Vinyl Game (12 covers)
  ...Array.from({ length: 12 }, (_, i) =>
    `/images/vinyl/cover-${String(i + 1).padStart(2, '0')}.png`
  ),

  // Diary Game (20 photos)
  '/images/diary/photo-01.png',
  '/images/diary/photo-02.png',
  '/images/diary/photo-03.png',
  '/images/diary/photo-04.png',
  '/images/diary/photo-05.png',
  '/images/diary/photo-06.png',
  '/images/diary/photo-07.png',
  '/images/diary/photo-08.png',
  '/images/diary/photo-09.png',
  '/images/diary/photo-10.png',
  '/images/diary/photo-11.png',
  '/images/diary/photo-12.png',
  '/images/diary/photo-13.png',
  '/images/diary/photo-14.png',
  '/images/diary/photo-15.png',
  '/images/diary/photo-16.png',
  '/images/diary/photo-17.png',
  '/images/diary/photo-18.png',
  '/images/diary/cover-19.png',
  '/images/diary/photo-20.jpg',

  // Quiz (SecretBox)
  '/images/quiz/q1-1.png',
  '/images/quiz/q1-2.png',
  '/images/quiz/q1-3.png',
  '/images/quiz/q1-4.png',
  '/images/quiz/q2-1.png',
  '/images/quiz/q2-2.png',
  '/images/quiz/q2-3.png',
  '/images/quiz/q2-4.png',

  // Finale
  '/images/finale/key.png',
  '/images/finale/box.png',
  '/images/finale/envelope.png',
  '/images/finale/pha.png',
];

// ── All audio paths used across every scene ──────────────────────────
const ALL_AUDIO_PATHS: string[] = [
  '/sounds/ticket-print.mp3',
  '/sounds/Train.mp3',
  '/sounds/cutting.mp3',
  '/sounds/cooking.mp3',
  '/sounds/drop.mp3',
  '/sounds/unlock.mp3',
  // Songs are large (3–7 MB each); we still preload them but they'll
  // stream in the background without blocking anything.
  ...Array.from({ length: 12 }, (_, i) =>
    `/sounds/song-${i + 1}.mp3`
  ),
];

// ── Preload a single image (returns a resolved promise on success or error) ──
function preloadImage(src: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Fail silently
    img.src = src;
  });
}

// ── Preload a single audio file via fetch (caches in browser) ────────
function preloadAudioFile(src: string): Promise<void> {
  return fetch(src, { mode: 'no-cors' })
    .then(() => undefined)
    .catch(() => undefined); // Fail silently
}

// ── Preload images in batches to avoid overwhelming the browser ──────
async function preloadImagesInBatches(
  paths: string[],
  batchSize: number = 4
): Promise<void> {
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    await Promise.all(batch.map(preloadImage));
  }
}

// ── Preload audio files in batches ───────────────────────────────────
async function preloadAudioInBatches(
  paths: string[],
  batchSize: number = 2
): Promise<void> {
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    await Promise.all(batch.map(preloadAudioFile));
  }
}

// ── Main entry point: kicks off all preloading in the background ─────
let hasStartedPreloading = false;

export function startAssetPreload(): void {
  // Guard: only run once per session
  if (hasStartedPreloading) return;
  hasStartedPreloading = true;

  // Fire-and-forget: images first (higher priority for visual scenes),
  // then audio files. Both run silently in the background.
  preloadImagesInBatches(ALL_IMAGE_PATHS, 4)
    .then(() => preloadAudioInBatches(ALL_AUDIO_PATHS, 2))
    .catch(() => {
      // Entire chain failed silently — nothing to do
    });
}
