import React, { useState } from 'react';
import { Play, BookOpen, Sparkles, Compass, Shield, Award } from 'lucide-react';
import { HowToPlayModal } from '../components/HowToPlayModal';
import { audioService } from '../services/audioService';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [showGuide, setShowGuide] = useState(false);

  const handleStartGame = () => {
    audioService.userInteracted();
    audioService.playMusic('menu');
    onStart();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-600 via-amber-500 to-orange-500 flex flex-col justify-between overflow-hidden text-white select-none">
      {/* Background Islamic Architecture Pattern SVG */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Decorative Golden Oriental Arches */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-900/30 to-transparent pointer-events-none flex justify-center">
        <div className="w-96 h-16 border-b-2 border-amber-300/40 rounded-b-full"></div>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center text-center space-y-6">
        {/* Arabic Title Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/50 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs sm:text-sm font-semibold tracking-wide shadow-lg">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Game Edukasi Bahasa Arab SMP/MTs</span>
        </div>

        {/* Main Title & Typography */}
        <div className="space-y-3">
          <h1 className="font-arabic text-4xl sm:text-6xl md:text-7xl font-black text-amber-100 tracking-wide drop-shadow-xl leading-snug">
            رِحْلَةُ الْمُغَامَرَةِ
          </h1>
          <h2 className="text-xl sm:text-3xl font-extrabold text-yellow-300 tracking-wider uppercase drop-shadow">
            RIHLATUL MUGHAMARAH
          </h2>
          <p className="text-sm sm:text-base text-amber-100 font-medium max-w-lg mx-auto leading-relaxed">
            Taklukkan rintangan di kota Timur Tengah, kumpulkan koin ilmu, dan kuasai 5 keterampilan Bahasa Arab bersama sang petualang!
          </p>
        </div>

        {/* Illustrated Character & Runner Stage Card */}
        <div className="relative w-64 sm:w-72 h-44 bg-gradient-to-b from-amber-400/30 to-amber-950/40 rounded-3xl p-4 border-2 border-amber-300/60 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center overflow-hidden group">
          {/* Runner Lanes Preview */}
          <div className="absolute inset-x-6 bottom-4 h-14 bg-stone-900/70 rounded-xl border border-amber-400/40 flex items-center justify-around px-4">
            <div className="w-1.5 h-full bg-amber-400/40"></div>
            <div className="w-1.5 h-full bg-amber-400/40"></div>
          </div>

          {/* Running Character Cartoon Avatar */}
          <div className="relative z-10 flex flex-col items-center animate-bounce" style={{ animationDuration: '1.4s' }}>
            {/* Keffiyeh / Head */}
            <div className="w-12 h-12 bg-amber-300 rounded-full border-2 border-amber-600 flex items-center justify-center shadow-lg relative">
              <div className="absolute -top-1 inset-x-1 h-3 bg-red-600 rounded-t-full border border-black/30"></div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
              </div>
            </div>
            {/* Green Adventurer Vest */}
            <div className="w-14 h-8 bg-emerald-600 rounded-b-xl border border-emerald-400 shadow-md flex items-center justify-center text-[10px] font-black text-yellow-300">
              مُغَامِرٌ
            </div>
          </div>

          <div className="absolute bottom-1 text-[11px] font-bold text-amber-200 uppercase tracking-widest">
            3-Lane Endless Runner
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm pt-2">
          <button
            onClick={handleStartGame}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-extrabold text-lg rounded-2xl shadow-xl border-2 border-emerald-300 transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
            <span>Mulai Bermain</span>
          </button>

          <button
            onClick={() => setShowGuide(true)}
            className="py-4 px-6 bg-amber-800/80 hover:bg-amber-800 active:scale-95 text-amber-100 font-bold text-base rounded-2xl border border-amber-400/50 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-amber-300" />
            <span>Petunjuk</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg w-full pt-4">
          <div className="p-2.5 bg-amber-900/40 rounded-xl border border-amber-400/30 text-center">
            <Compass className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
            <p className="text-xs font-bold">8 Tema SMP</p>
            <p className="text-[10px] text-amber-200">Kosakata Lengkap</p>
          </div>

          <div className="p-2.5 bg-amber-900/40 rounded-xl border border-amber-400/30 text-center">
            <Shield className="w-5 h-5 text-emerald-300 mx-auto mb-1" />
            <p className="text-xs font-bold">5 Maharah</p>
            <p className="text-[10px] text-amber-200">Keterampilan Bahasa</p>
          </div>

          <div className="p-2.5 bg-amber-900/40 rounded-xl border border-amber-400/30 text-center">
            <Award className="w-5 h-5 text-blue-300 mx-auto mb-1" />
            <p className="text-xs font-bold">Gemini AI</p>
            <p className="text-[10px] text-amber-200">Kuis & Evaluasi Cerdas</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-amber-200/80 safe-pb">
        رِحْلَةُ الْمُغَامَرَةِ • Media Pembelajaran Interaktif Bahasa Arab Kelas VII–IX
      </footer>

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};
