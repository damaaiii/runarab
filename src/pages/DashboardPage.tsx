import React from 'react';
import { PlayerStats } from '../types/game';
import { Play, BookOpen, BarChart3, Trophy, Settings, Sparkles, Coins, Flame, ChevronRight, GraduationCap } from 'lucide-react';
import { ARABIC_THEMES } from '../data/arabicData';

interface DashboardPageProps {
  stats: PlayerStats;
  onNavigate: (view: string) => void;
  onQuickPlay: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ stats, onNavigate, onQuickPlay }) => {
  const accuracy =
    stats.questionsAnswered > 0
      ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Player Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-2 border-amber-400">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Avatar & Player Info */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-300 to-yellow-100 border-3 border-white shadow-lg flex items-center justify-center text-3xl">
                {stats.avatar === 'fatimah' ? '🧕' : stats.avatar === 'sultan' ? '👑' : '👳‍♂️'}
              </div>
              <span className="absolute -bottom-2 -right-1 px-2 py-0.5 bg-amber-900 text-yellow-300 text-[10px] font-black rounded-full border border-amber-300 shadow">
                LVL {stats.level}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-wide drop-shadow">
                  {stats.name}
                </h2>
                <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full font-bold">
                  فَارِسُ الْعَرَبِيَّةِ
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                Penjelajah Bahasa Arab • Siswa SMP/MTs
              </p>
            </div>
          </div>

          {/* Quick Play Big Button */}
          <button
            onClick={onQuickPlay}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-amber-50 active:scale-95 text-amber-900 font-extrabold text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-amber-700 text-amber-700 group-hover:scale-110 transition-transform" />
            <span>Mulai Petualangan Lari</span>
            <ChevronRight className="w-5 h-5 text-amber-600" />
          </button>
        </div>
      </div>

      {/* Main Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Skor Tertinggi</p>
            <p className="text-lg sm:text-xl font-black text-slate-800">{stats.highScore}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-yellow-100 text-yellow-700 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Total Koin</p>
            <p className="text-lg sm:text-xl font-black text-amber-700">{stats.coins}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Akurasi Soal</p>
            <p className="text-lg sm:text-xl font-black text-emerald-800">{accuracy}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Total Berlari</p>
            <p className="text-lg sm:text-xl font-black text-rose-800">{stats.totalRuns} kali</p>
          </div>
        </div>
      </div>

      {/* Main Menu Navigation Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>Menu Utama Petualangan</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Pilih Level / Tema */}
          <button
            onClick={() => onNavigate('level-select')}
            className="p-5 bg-white hover:bg-amber-50/50 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-amber-400 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                🧭
              </div>
              <div>
                <p className="font-extrabold text-base text-slate-800">Pilih Tema & Level</p>
                <p className="text-xs text-slate-500">8 tema kurikulum SMP/MTs</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Card 2: Vocabulary Book */}
          <button
            onClick={() => onNavigate('vocabulary')}
            className="p-5 bg-white hover:bg-amber-50/50 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-amber-400 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                📖
              </div>
              <div>
                <p className="font-extrabold text-base text-slate-800">Vocabulary Book</p>
                <p className="text-xs text-slate-500">
                  {stats.collectedWordIds.length} kosakata terkumpul & audio
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Card 3: Learning Progress */}
          <button
            onClick={() => onNavigate('progress')}
            className="p-5 bg-white hover:bg-amber-50/50 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-amber-400 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                📊
              </div>
              <div>
                <p className="font-extrabold text-base text-slate-800">Learning Progress</p>
                <p className="text-xs text-slate-500">Rekap 5 Maharah & AI Feedback</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Card 4: Leaderboard */}
          <button
            onClick={() => onNavigate('leaderboard')}
            className="p-5 bg-white hover:bg-amber-50/50 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-amber-400 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                🏆
              </div>
              <div>
                <p className="font-extrabold text-base text-slate-800">Leaderboard Juara</p>
                <p className="text-xs text-slate-500">Peringkat skor petualang</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Card 5: Profile & Settings */}
          <button
            onClick={() => onNavigate('profile')}
            className="p-5 bg-white hover:bg-amber-50/50 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-amber-400 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-600 to-slate-800 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                ⚙️
              </div>
              <div>
                <p className="font-extrabold text-base text-slate-800">Profil & Pengaturan</p>
                <p className="text-xs text-slate-500">Ubah avatar, nama & suara</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};
