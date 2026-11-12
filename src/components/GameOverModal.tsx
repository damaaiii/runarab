import React, { useState, useEffect } from 'react';
import { fetchLearningFeedback } from '../services/geminiService';
import { Trophy, Coins, Footprints, Award, RotateCcw, Home, Sparkles, BookOpen } from 'lucide-react';

interface GameOverModalProps {
  stats: {
    score: number;
    coins: number;
    distance: number;
    quizzesSolved: number;
    quizzesCorrect: number;
  };
  playerName: string;
  themeTitle: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onViewProgress: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  playerName,
  themeTitle,
  onPlayAgain,
  onBackToMenu,
  onViewProgress,
}) => {
  const [feedback, setFeedback] = useState<any>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  const accuracy =
    stats.quizzesSolved > 0
      ? Math.round((stats.quizzesCorrect / stats.quizzesSolved) * 100)
      : 0;

  useEffect(() => {
    let isMounted = true;
    async function loadFeedback() {
      const fb = await fetchLearningFeedback({
        playerName,
        score: stats.score,
        accuracy,
        totalAnswered: stats.quizzesSolved,
        correctCount: stats.quizzesCorrect,
        skillScores: {},
        themeTitle,
      });
      if (isMounted) {
        setFeedback(fb);
        setLoadingFeedback(false);
      }
    }
    loadFeedback();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl shadow-2xl border-4 border-amber-400 p-5 sm:p-7 space-y-5 text-center max-h-[94vh] overflow-y-auto">
        {/* Banner */}
        <div className="inline-block px-6 py-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white rounded-full font-bold shadow-lg text-sm sm:text-base tracking-wide">
          اِنْتَهَتِ الرِّحْلَةُ • Petualangan Berakhir
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-arabic">
            أَحْسَنْتَ يَا بَطَلُ!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Perjalanan hebat dalam tema <strong>{themeTitle}</strong>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center">
            <Trophy className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-lg font-black text-slate-800">{stats.score}</span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Skor</span>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center">
            <Coins className="w-5 h-5 text-yellow-500 mb-1" />
            <span className="text-lg font-black text-amber-700">{stats.coins}</span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Koin</span>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center">
            <Footprints className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-lg font-black text-emerald-800">{stats.distance}m</span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Jarak</span>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center">
            <Award className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-lg font-black text-indigo-800">{accuracy}%</span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Akurasi</span>
          </div>
        </div>

        {/* AI Teacher Feedback Box */}
        <div className="p-4 bg-gradient-to-r from-amber-100/90 to-orange-100/90 rounded-2xl border-2 border-amber-300 text-left space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Catatan Evaluasi Guru (Gemini AI)</span>
          </div>

          {loadingFeedback ? (
            <div className="py-2 text-xs text-amber-800 animate-pulse text-center">
              Menghubungkan catatan evaluasi guru...
            </div>
          ) : (
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-800">
              <p className="font-bold text-amber-900 font-arabic text-base sm:text-lg">
                {feedback?.greeting}
              </p>
              <p className="leading-relaxed">{feedback?.appraisal}</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Rekomendasi: </strong>
                {feedback?.recommendation}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Main Lagi</span>
          </button>

          <button
            onClick={onViewProgress}
            className="py-3 px-4 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            <span>Rapor Belajar</span>
          </button>

          <button
            onClick={onBackToMenu}
            className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
