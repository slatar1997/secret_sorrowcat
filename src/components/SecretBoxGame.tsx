import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecretBoxGameProps {
  onBackToDesk: () => void;
  selectedQuizImages: string[];
  setSelectedQuizImages: React.Dispatch<React.SetStateAction<string[]>>;
  isTortillaCooked: boolean;
  onComplete: () => void;
}

interface QuizQuestion {
  questionText: string;
  options: string[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    questionText: 'คำถามข้อที่ 1: เลือกรูปดอกไม้ที่ชอบ',
    options: [
      '/images/quiz/q1-1.png',
      '/images/quiz/q1-2.png',
      '/images/quiz/q1-3.png',
      '/images/quiz/q1-4.png',
    ],
  },
  {
    questionText: 'คำถามข้อที่ 2: เลือกรูปน้องหมาที่ชอบ',
    options: [
      '/images/quiz/q2-1.png',
      '/images/quiz/q2-2.png',
      '/images/quiz/q2-3.png',
      '/images/quiz/q2-4.png',
    ],
  },
];

function SecretBoxGame({
  onBackToDesk,
  setSelectedQuizImages,
  onComplete,
}: SecretBoxGameProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Reset selected images when quiz starts
  useEffect(() => {
    setSelectedQuizImages([]);
  }, [setSelectedQuizImages]);

  const handleSelectOption = useCallback(
    (optionPath: string) => {
      setSelectedQuizImages((prev) => [...prev, optionPath]);

      if (currentStep < QUIZ_QUESTIONS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        onComplete();
      }
    },
    [currentStep, setSelectedQuizImages, onComplete]
  );

  const currentQuestion = QUIZ_QUESTIONS[currentStep];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* ── Wood table background ── */}
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

      {/* Soft shadow around edges */}
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

      {/* ── Quiz Container ── */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full">
        {/* Top Title & Progress Indicator */}
        <div className="text-center mb-6 max-w-md">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md mb-1"
            style={{ fontFamily: "'Itim', cursive" }}
          >
            🧩 ตอบคำถามเพื่อไขกล่องลับ
          </motion.h1>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-2">
            {QUIZ_QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-purple-400 w-6' : 'bg-white/60'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Quiz Card */}
        <div className="w-[85vw] max-w-5xl h-[78vh] mx-auto rounded-3xl shadow-2xl relative p-8 bg-amber-50 border-2 border-purple-200 flex flex-col justify-center overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <p
                className="text-lg sm:text-2xl text-purple-900 font-bold text-center leading-relaxed"
                style={{ fontFamily: "'Mali', cursive" }}
              >
                {currentQuestion.questionText}
              </p>

              {/* Grid of 4 choices */}
              <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                {currentQuestion.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    className="relative group aspect-square rounded-2xl bg-white border-4 border-purple-100 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 cursor-pointer p-2 shadow-md flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectOption(option)}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden bg-purple-50 shadow-inner">
                      <img
                        src={option}
                        alt={`Option ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        draggable={false}
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default SecretBoxGame;
