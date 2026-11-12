import React, { useState } from 'react';
import { ARABIC_THEMES } from '../data/arabicData';
import { ArabicTheme } from '../types/game';
import { Lock, Play, Sparkles, CheckCircle2, ChevronRight, Compass } from 'lucide-react';

interface LevelSelectPageProps {
  playerLevel: number;
  unlockedThemes: string[];
  onSelectTheme: (theme: ArabicTheme, difficulty: 'mudah' | 'sedang' | 'sulit') => void;
}

export const LevelSelectPage: React.FC<LevelSelectPageProps> = ({
  playerLevel,
  unlockedThemes,
  onSelectTheme,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>('taaruf');
  const [difficulty, setDifficulty] = useState<'mudah' | 'sedang' | 'sulit'>('mudah');

  const selectedTheme =
    ARABIC_THEMES.find((t) => t.id === selectedThemeId) || ARABIC_THEMES[0];
  const isSelectedLocked =
    !unlockedThemes.includes(selectedTheme.id) &&
    playerLevel < selectedTheme.requiredLevel;

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Compass className="w-6 h-6 text-amber-600" />
          <span>Pilih Tema Pembelajaran (اخْتَرْ الْمَوْضُوعَ)</span>
        </h2>
        <p className="text-sm text-slate-600">
          Pilih tema materi Bahasa Arab dan tingkat kesulitan untuk memulai petualangan lari.
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {ARABIC_THEMES.map((theme) => {
          const isUnlocked =
            unlockedThemes.includes(theme.id) || playerLevel >= theme.requiredLevel;
          const isSelected = selectedThemeId === theme.id;

          return (
            <div
              key={theme.id}
              onClick={() => setSelectedThemeId(theme.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-44 shadow-sm ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400'
                  : isUnlocked
                  ? 'border-slate-200 bg-white hover:border-amber-300'
                  : 'border-slate-200 bg-slate-100 opacity-70'
              }`}
            >
              {/* Lock Badge */}
              {!isUnlocked && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-bold">
                  <Lock className="w-3 h-3" />
                  <span>Level {theme.requiredLevel}</span>
                </div>
              )}

              {isUnlocked && isSelected && (
                <div className="absolute top-3 right-3 text-amber-600">
                  <CheckCircle2 className="w-5 h-5 fill-amber-500 text-white" />
                </div>
              )}

              {/* Theme Header */}
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {theme.id === 'taaruf' ? '🤝' : theme.id === 'madrasah' ? '🏫' : theme.id === 'usrah' ? '👨‍👩‍👧' : theme.id === 'mihnah' ? '💼' : theme.id === 'bait' ? '🏡' : theme.id === 'hayawanat' ? '🦁' : theme.id === 'alwan' ? '🎨' : '⏰'}
                </div>
                <h3 className="font-arabic text-xl font-bold text-slate-800 pt-1">
                  {theme.titleArabic}
                </h3>
                <h4 className="font-extrabold text-sm text-amber-900">
                  {theme.titleIndonesian}
                </h4>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2">
                {theme.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Theme Details & Difficulty Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">
              Tema Terpilih
            </span>
            <div className="flex items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {selectedTheme.titleIndonesian}
              </h3>
              <span className="font-arabic text-xl font-bold text-amber-700">
                {selectedTheme.titleArabic}
              </span>
            </div>
          </div>

          {/* Difficulty Buttons */}
          <div className="flex items-center gap-2">
            {(['mudah', 'sedang', 'sulit'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  difficulty === lvl
                    ? lvl === 'mudah'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : lvl === 'sedang'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-600">
            {isSelectedLocked
              ? `Tema ini terkunci. Capai Level ${selectedTheme.requiredLevel} untuk membukanya!`
              : `Siap berlari dan menghadapi rintangan serta soal Bahasa Arab bertema ${selectedTheme.titleIndonesian}!`}
          </p>

          <button
            onClick={() => onSelectTheme(selectedTheme, difficulty)}
            disabled={isSelectedLocked}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              isSelectedLocked
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95'
            }`}
          >
            {isSelectedLocked ? (
              <>
                <Lock className="w-5 h-5" />
                <span>Level Belum Cukup</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Mulai Petualangan</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
