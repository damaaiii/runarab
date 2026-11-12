import React from 'react';
import { PlayerStats } from '../types/game';
import { Trophy, Medal, Crown, Star } from 'lucide-react';

interface LeaderboardPageProps {
  stats: PlayerStats;
}

interface LeaderboardEntry {
  name: string;
  avatar: string;
  score: number;
  level: number;
  titleArabic: string;
  isCurrentPlayer?: boolean;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ stats }) => {
  // Curated cohort of SMP/MTs student adventurers alongside current player
  const mockRivals: LeaderboardEntry[] = [
    { name: 'Zaid Al-Faris', avatar: '👳‍♂️', score: 3820, level: 4, titleArabic: 'فَارِسُ الصَّحْرَاءِ', isCurrentPlayer: false },
    { name: 'Maryam As-Salimah', avatar: '🧕', score: 3250, level: 4, titleArabic: 'نَجْمَةُ الْعِلْمِ', isCurrentPlayer: false },
    { name: 'Umar Al-Khattab', avatar: '👑', score: 2600, level: 3, titleArabic: 'الْقَائِدُ الْبَطَلُ', isCurrentPlayer: false },
    { name: 'Fatimah Zahra', avatar: '🧕', score: 2100, level: 3, titleArabic: 'طَالِبَةٌ مُمْتَازَةٌ', isCurrentPlayer: false },
    { name: 'Bilal An-Najm', avatar: '👳‍♂️', score: 1450, level: 2, titleArabic: 'مُجْتَهِدٌ', isCurrentPlayer: false },
  ];

  // Merge player into leaderboard and sort
  const allEntries: LeaderboardEntry[] = [
    ...mockRivals,
    {
      name: `${stats.name} (Kamu)`,
      avatar: stats.avatar === 'fatimah' ? '🧕' : stats.avatar === 'sultan' ? '👑' : '👳‍♂️',
      score: stats.highScore || 850,
      level: stats.level,
      titleArabic: 'فَارِسُ الْعَرَبِيَّةِ',
      isCurrentPlayer: true,
    },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-600" />
          <span>Papan Juara Petualang (لَوْحَةُ الصَّدَارَةِ)</span>
        </h2>
        <p className="text-sm text-slate-600">
          Peringkat skor tertinggi para pejuang Bahasa Arab SMP/MTs.
        </p>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
        {/* Rank 2 */}
        <div className="flex flex-col items-center bg-white p-3 rounded-2xl border-2 border-slate-300 shadow-sm order-1">
          <div className="text-3xl mb-1">{allEntries[1]?.avatar}</div>
          <Medal className="w-5 h-5 text-slate-400 mb-1" />
          <p className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[90px] sm:max-w-none">
            {allEntries[1]?.name}
          </p>
          <p className="font-black text-sm text-slate-600">{allEntries[1]?.score}</p>
          <div className="w-full bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg py-1 mt-2 text-center">
            Juara 2
          </div>
        </div>

        {/* Rank 1 (Crown) */}
        <div className="flex flex-col items-center bg-gradient-to-b from-amber-50 to-yellow-100 p-4 rounded-3xl border-3 border-yellow-400 shadow-md order-2 -translate-y-2">
          <Crown className="w-6 h-6 text-yellow-500 fill-yellow-400 animate-bounce mb-1" />
          <div className="text-4xl mb-1">{allEntries[0]?.avatar}</div>
          <p className="font-extrabold text-sm sm:text-base text-amber-950 truncate max-w-[100px] sm:max-w-none">
            {allEntries[0]?.name}
          </p>
          <span className="font-arabic text-xs font-bold text-amber-700">
            {allEntries[0]?.titleArabic}
          </span>
          <p className="font-black text-base sm:text-lg text-amber-600 mt-1">
            {allEntries[0]?.score}
          </p>
          <div className="w-full bg-yellow-400 text-amber-950 text-xs font-extrabold rounded-xl py-1.5 mt-2 text-center shadow-sm">
            👑 Juara 1
          </div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center bg-white p-3 rounded-2xl border-2 border-amber-600/40 shadow-sm order-3">
          <div className="text-3xl mb-1">{allEntries[2]?.avatar}</div>
          <Medal className="w-5 h-5 text-amber-700 mb-1" />
          <p className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[90px] sm:max-w-none">
            {allEntries[2]?.name}
          </p>
          <p className="font-black text-sm text-amber-800">{allEntries[2]?.score}</p>
          <div className="w-full bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg py-1 mt-2 text-center">
            Juara 3
          </div>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-white rounded-3xl border-2 border-amber-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-amber-100">
          {allEntries.map((player, idx) => (
            <div
              key={idx}
              className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                player.isCurrentPlayer ? 'bg-amber-100/80 font-bold' : 'hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 text-center font-black text-sm sm:text-base ${
                  idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-slate-500' : idx === 2 ? 'text-amber-700' : 'text-slate-400'
                }`}>
                  #{idx + 1}
                </span>

                <div className="text-2xl">{player.avatar}</div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm sm:text-base text-slate-900">
                      {player.name}
                    </p>
                    {player.isCurrentPlayer && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold">
                        Anda
                      </span>
                    )}
                  </div>
                  <span className="font-arabic text-xs text-amber-700 font-semibold">
                    {player.titleArabic} • Level {player.level}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-black text-base sm:text-lg text-amber-900">
                  {player.score}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400">Poin</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
