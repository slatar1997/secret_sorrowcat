import { useState, useEffect } from 'react';
import PasswordGate from './components/PasswordGate';
import TicketScene from './components/TicketScene';
import LondonScene from './components/LondonScene';
import DeskScene from './components/DeskScene';
import TortillaGame from './components/TortillaGame';
import VinylGame from './components/VinylGame';
import DiaryGame from './components/DiaryGame';
import SecretBoxGame from './components/SecretBoxGame';
import FinalScene from './components/FinalScene';
import { startAssetPreload } from './utils/preloadAssets';

// Game flow phases matching spec Step 1 → Step 9
type GamePhase =
  | 'password'
  | 'ticket'
  | 'london'
  | 'desktop'
  | 'final';

// Sub-scenes within the desktop hub (Step 4)
type DesktopSubPhase =
  | 'hub'
  | 'tortilla'
  | 'vinyl'
  | 'diary'
  | 'secretbox';

function App() {
  const [phase, setPhase] = useState<GamePhase>('password');
  const [desktopSub, setDesktopSub] = useState<DesktopSubPhase>('hub');

  // Global state that flows across components
  const [passengerName, setPassengerName] = useState<string>('');
  const [isTortillaCooked, setIsTortillaCooked] = useState<boolean>(false);
  const [isVinylPlayed, setIsVinylPlayed] = useState<boolean>(false);
  const [isDiaryRead, setIsDiaryRead] = useState<boolean>(false);
  const [selectedQuizImages, setSelectedQuizImages] = useState<string[]>([]);

  // Suppress unused-variable warnings — passengerName can be referenced if needed
  void passengerName;

  // Begin background asset preloading once the password gate is passed
  useEffect(() => {
    if (phase !== 'password') {
      startAssetPreload();
    }
  }, [phase]);

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {phase === 'password' && (
        <PasswordGate onUnlocked={() => setPhase('ticket')} />
      )}

      {phase === 'ticket' && (
        <TicketScene
          onSetPassengerName={setPassengerName}
          onComplete={() => setPhase('london')}
        />
      )}

      {phase === 'london' && (
        <LondonScene onComplete={() => setPhase('desktop')} />
      )}

      {phase === 'desktop' && (
        <>
          {/* Hub — central desk with 4 buttons */}
          {desktopSub === 'hub' && (
            <DeskScene
              isTortillaCooked={isTortillaCooked}
              isVinylPlayed={isVinylPlayed}
              isDiaryRead={isDiaryRead}
              onOpenTortilla={() => setDesktopSub('tortilla')}
              onOpenVinyl={() => setDesktopSub('vinyl')}
              onOpenDiary={() => setDesktopSub('diary')}
              onOpenSecretBox={() => setDesktopSub('secretbox')}
            />
          )}

          {/* Sub-scene handlers */}
          {desktopSub === 'tortilla' && (
            <TortillaGame
              onComplete={() => {
                setIsTortillaCooked(true);
                setDesktopSub('hub');
              }}
              onBackToDesk={() => setDesktopSub('hub')}
            />
          )}

          {desktopSub === 'vinyl' && (
            <VinylGame
              onVinylPlayed={() => setIsVinylPlayed(true)}
              onBackToDesk={() => setDesktopSub('hub')}
            />
          )}

          {desktopSub === 'diary' && (
            <DiaryGame
              onDiaryRead={() => setIsDiaryRead(true)}
              onBackToDesk={() => setDesktopSub('hub')}
            />
          )}

          {desktopSub === 'secretbox' && (
            <SecretBoxGame
              onBackToDesk={() => setDesktopSub('hub')}
              selectedQuizImages={selectedQuizImages}
              setSelectedQuizImages={setSelectedQuizImages}
              isTortillaCooked={isTortillaCooked}
              onComplete={() => setPhase('final')}
            />
          )}
        </>
      )}

      {phase === 'final' && (
        <FinalScene
          selectedQuizImages={selectedQuizImages}
          isTortillaCooked={isTortillaCooked}
          onBackToDesk={() => {
            setPhase('desktop');
            setDesktopSub('hub');
          }}
        />
      )}
    </div>
  );
}

export default App;
