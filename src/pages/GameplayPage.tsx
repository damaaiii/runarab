import React, { useState, useRef, useEffect } from 'react';
import { ArabicTheme, QuizQuestion } from '../types/game';
import { PhaserGame } from '../game/PhaserGame';
import { ArabicRunnerScene, GameEventCallbacks } from '../game/ArabicRunnerScene';
import { QuizModal } from '../components/QuizModal';
import { GameOverModal } from '../components/GameOverModal';
import { fetchQuizQuestion } from '../services/geminiService';
import { audioService } from '../services/audioService';
import {
  Heart,
  Coins,
  Trophy,
  Footprints,
  Pause,
  Play,
  RotateCcw,
  Home,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Shield,
  Zap,
} from 'lucide-react';

interface GameplayPageProps {
  theme: ArabicTheme;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  playerName: string;
  onBackToMenu: () => void;
  onViewProgress: () => void;
  onSaveRun: (
    score: number,
    coins: number,
    quizzesAnswered: number,
    quizzesCorrect: number,
    newWords: string[]
  ) => void;
  onRecordSkill: (skill: any, isCorrect: boolean) => void;
}

export const GameplayPage: React.FC<GameplayPageProps> = ({
  theme,
  difficulty,
  playerName,
  onBackToMenu,
  onViewProgress,
  onSaveRun,
  onRecordSkill,
}) => {
  // Game HUD state
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);
  const [activePowerUp, setActivePowerUp] = useState<{ name: string; duration: number } | null>(null);

  // Flow State
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [quizzesAnswered, setQuizzesAnswered] = useState(0);
  const [quizzesCorrect, setQuizzesCorrect] = useState(0);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Scene Reference
  const sceneRef = useRef<ArabicRunnerScene | null>(null);

  // Start gameplay background music
  useEffect(() => {
    audioService.playMusic('gameplay');
    return () => {
      audioService.playMusic('menu');
    };
  }, []);

  // Handle quiz trigger from Phaser
  const handleTriggerQuiz = async (_speed: number) => {
    setIsLoadingQuiz(true);
    const skillsList = ['istima', 'kalam', 'qiraah', 'kitabah', 'mufradat'] as const;
    const randomSkill = skillsList[Math.floor(Math.random() * skillsList.length)];

    const quiz = await fetchQuizQuestion(theme.id, randomSkill, difficulty);
    setIsLoadingQuiz(false);
    setActiveQuiz(quiz);
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    setQuizzesAnswered((prev) => prev + 1);
    if (isCorrect) {
      setQuizzesCorrect((prev) => prev + 1);
    }

    if (activeQuiz) {
      onRecordSkill(activeQuiz.skill, isCorrect);
    }

    setActiveQuiz(null);
    sceneRef.current?.resumeFromQuiz(isCorrect);
  };

  const handleGameOver = (stats: { score: number; coins: number; distance: number }) => {
    setIsGameOver(true);
    setFinalStats(stats);
    onSaveRun(stats.score, stats.coins, quizzesAnswered, quizzesCorrect, []);
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      sceneRef.current?.resumeGame();
      setIsPaused(false);
    } else {
      sceneRef.current?.pauseGame();
      setIsPaused(true);
    }
  };

  // Virtual buttons for mobile controls
  const handleVirtualLeft = () => sceneRef.current?.moveLane(-1);
  const handleVirtualRight = () => sceneRef.current?.moveLane(1);
  const handleVirtualJump = () => sceneRef.current?.jump();
  const handleVirtualSlide = () => sceneRef.current?.slide();

  const callbacks: GameEventCallbacks = {
    onScoreUpdate: (s, c, d) => {
      setScore(s);
      setCoins(c);
      setDistance(d);
    },
    onLivesUpdate: (l) => setLives(l),
    onTriggerQuiz: handleTriggerQuiz,
    onGameOver: handleGameOver,
    onPowerUpActive: (name, duration) => {
      setActivePowerUp({ name, duration });
      setTimeout(() => setActivePowerUp(null), duration * 1000);
    },
  };

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Top HUD Overlay */}
      <header className="absolute top-0 inset-x-0 z-30 p-2 sm:p-4 flex items-center justify-between safe-pt pointer-events-none">
        {/* Left: Hearts & Theme Info */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Lives Indicator */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-rose-500/50 shadow-lg">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-5 h-5 transition-transform ${
                  heartIndex <= lives
                    ? 'text-rose-500 fill-rose-500 scale-100'
                    : 'text-slate-600 fill-slate-700 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Theme Pill */}
          <div className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/50 text-xs font-bold text-amber-200">
            <span className="font-arabic text-sm">{theme.titleArabic}</span>
            <span className="hidden sm:inline opacity-75">• {theme.titleIndonesian}</span>
          </div>
        </div>

        {/* Center: Power-Up Pill if active */}
        {activePowerUp && (
          <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-xl animate-pulse flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{activePowerUp.name}</span>
          </div>
        )}

        {/* Right: Score, Coins, Distance, Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-yellow-500/50 text-xs font-black text-yellow-300 shadow-lg">
            <Coins className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{coins}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/50 text-xs font-black text-amber-200 shadow-lg">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{score}</span>
          </div>

          {/* Distance */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/50 text-xs font-bold text-emerald-300 shadow-lg">
            <Footprints className="w-4 h-4 text-emerald-400" />
            <span>{distance}m</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={handlePauseToggle}
            className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow-lg active:scale-90 transition-all cursor-pointer"
            title="Jeda Permainan"
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>
        </div>
      </header>

      {/* Main Runner Canvas */}
      <div className="flex-1 w-full h-full relative">
        <PhaserGame
          callbacks={callbacks}
          onSceneReady={(scene) => {
            sceneRef.current = scene;
          }}
        />

        {/* Loading Quiz Indicator */}
        {isLoadingQuiz && (
          <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
            <div className="p-5 bg-amber-900/90 rounded-2xl border-2 border-amber-400 text-white text-center space-y-2 shadow-2xl animate-pulse">
              <span className="font-arabic text-3xl font-black text-amber-300">مَخْطُوطَةُ الْعِلْمِ</span>
              <p className="text-sm font-bold">Membuka Gulungan Ilmu Bahasa Arab...</p>
            </div>
          </div>
        )}
      </div>

      {/* Virtual Touch Controller (Mobile Ergonomics) */}
      <div className="absolute bottom-2 inset-x-2 z-30 flex items-center justify-between safe-pb pointer-events-none px-2 sm:px-6">
        {/* Left & Right Steering */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onPointerDown={handleVirtualLeft}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-amber-600 text-white border-2 border-amber-500/60 shadow-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            title="Geser Kiri"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <button
            onPointerDown={handleVirtualRight}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-amber-600 text-white border-2 border-amber-500/60 shadow-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            title="Geser Kanan"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

        {/* Jump & Slide Actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onPointerDown={handleVirtualSlide}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-orange-600 text-white border-2 border-orange-500/60 shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer"
            title="Merunduk / Slide"
          >
            <ArrowDown className="w-6 h-6" />
            <span className="text-[9px] font-bold tracking-tight uppercase">Slide</span>
          </button>
          <button
            onPointerDown={handleVirtualJump}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-emerald-600 text-white border-2 border-emerald-500/60 shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer"
            title="Lompat"
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-[9px] font-bold tracking-tight uppercase">Lompat</span>
          </button>
        </div>
      </div>

      {/* Pause Menu Modal Overlay */}
      {isPaused && !activeQuiz && !isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 border-4 border-amber-400 shadow-2xl text-center space-y-5">
            <h3 className="font-arabic text-3xl font-black text-amber-950">تَوَقَّفَ مُؤَقَّتًا</h3>
            <p className="text-sm font-semibold text-slate-700">Permainan Sedang Dijeda</p>

            <div className="space-y-2.5">
              <button
                onClick={handlePauseToggle}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Lanjutkan Berlari</span>
              </button>

              <button
                onClick={() => {
                  sceneRef.current?.scene.restart({ callbacks });
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Ulangi Babak Ini</span>
              </button>

              <button
                onClick={onBackToMenu}
                className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5" />
                <span>Keluar ke Menu Utama</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuiz && (
        <QuizModal question={activeQuiz} onAnswerComplete={handleQuizAnswer} />
      )}

      {/* Game Over Modal */}
      {isGameOver && finalStats && (
        <GameOverModal
          stats={{
            score: finalStats.score,
            coins: finalStats.coins,
            distance: finalStats.distance,
            quizzesSolved: quizzesAnswered,
            quizzesCorrect: quizzesCorrect,
          }}
          playerName={playerName}
          themeTitle={theme.titleIndonesian}
          onPlayAgain={() => {
            setIsGameOver(false);
            setQuizzesAnswered(0);
            setQuizzesCorrect(0);
            sceneRef.current?.scene.restart({ callbacks });
          }}
          onBackToMenu={onBackToMenu}
          onViewProgress={onViewProgress}
        />
      )}
    </div>
  );
};
