import React, { useState } from 'react';
import { VOCABULARY_DICTIONARY, ARABIC_THEMES } from '../data/arabicData';
import { VocabularyItem } from '../types/game';
import { audioService } from '../services/audioService';
import { Volume2, BookOpen, Search, Filter, Sparkles } from 'lucide-react';

interface VocabularyBookPageProps {
  collectedWordIds: string[];
}

export const VocabularyBookPage: React.FC<VocabularyBookPageProps> = ({ collectedWordIds }) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWordAudio, setActiveWordAudio] = useState<string | null>(null);

  const filteredWords = VOCABULARY_DICTIONARY.filter((item) => {
    const matchesTheme = selectedThemeId === 'all' || item.themeId === selectedThemeId;
    const matchesSearch =
      item.wordArabic.includes(searchQuery) ||
      item.meaningIndonesian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.transliteration.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  const handleSpeak = async (word: VocabularyItem) => {
    setActiveWordAudio(word.id);
    await audioService.speakArabic(word.audioText || word.wordArabic);
    setActiveWordAudio(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-600" />
          <span>Buku Kosakata (مُعْجَمُ الْمُفْرَدَاتِ)</span>
        </h2>
        <p className="text-sm text-slate-600">
          Kamus mufrodat tematik SMP/MTs lengkap dengan harakat, pelafalan audio, dan contoh kalimat.
        </p>
      </div>

      {/* Search & Theme Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata Arab, arti Indonesia, atau lafal..."
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm shadow-sm"
          />
        </div>

        {/* Theme Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedThemeId}
            onChange={(e) => setSelectedThemeId(e.target.value)}
            className="bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Semua Tema ({VOCABULARY_DICTIONARY.length})</option>
            {ARABIC_THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.titleIndonesian} ({theme.titleArabic})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredWords.map((item) => {
          const isCollected = collectedWordIds.includes(item.id);
          const isPlaying = activeWordAudio === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border-2 transition-all shadow-sm flex flex-col justify-between space-y-3 ${
                isCollected
                  ? 'bg-white border-amber-300 hover:shadow-md'
                  : 'bg-amber-50/50 border-amber-200 hover:bg-white'
              }`}
            >
              {/* Word Header */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {item.category}
                </span>

                <button
                  onClick={() => handleSpeak(item)}
                  disabled={isPlaying}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-white animate-bounce'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95'
                  }`}
                  title="Dengarkan Pelafalan Bahasa Arab"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Arabic Word Display */}
              <div className="text-right space-y-1">
                <h3 className="font-arabic text-2xl sm:text-3xl font-extrabold text-amber-950 leading-relaxed">
                  {item.wordArabic}
                </h3>
                <p className="text-xs font-mono text-amber-700 font-semibold">
                  {item.transliteration}
                </p>
              </div>

              {/* Indonesian Meaning */}
              <div className="pt-2 border-t border-amber-100 space-y-1">
                <p className="text-sm font-extrabold text-slate-800">
                  {item.meaningIndonesian}
                </p>

                {item.exampleSentenceArabic && (
                  <div className="p-2 rounded-lg bg-amber-50 text-right space-y-0.5">
                    <p className="font-arabic text-sm text-slate-700 leading-normal">
                      {item.exampleSentenceArabic}
                    </p>
                    <p className="text-[11px] text-slate-500 text-left italic">
                      "{item.exampleSentenceIndonesian}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredWords.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-amber-300 space-y-2">
          <BookOpen className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="font-bold text-slate-700">Tidak ada kosakata yang cocok</p>
          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter tema.</p>
        </div>
      )}
    </div>
  );
};
