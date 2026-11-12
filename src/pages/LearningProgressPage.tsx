import React from 'react';
import { PlayerStats, ArabicSkill } from '../types/game';
import { BarChart3, Award, Sparkles, CheckCircle2, XCircle, BookOpen, TrendingUp, Lightbulb } from 'lucide-react';

interface LearningProgressPageProps {
  stats: PlayerStats;
}

export const LearningProgressPage: React.FC<LearningProgressPageProps> = ({ stats }) => {
  const skillsList: { id: ArabicSkill; nameArabic: string; nameId: string; color: string }[] = [
    { id: 'istima', nameArabic: 'الِاسْتِمَاعُ', nameId: "Menyimak (Istima')", color: 'bg-blue-500' },
    { id: 'kalam', nameArabic: 'الْكَلَامُ', nameId: 'Berbicara (Kalam)', color: 'bg-emerald-500' },
    { id: 'qiraah', nameArabic: 'الْقِرَاءَةُ', nameId: "Membaca (Qira'ah)", color: 'bg-purple-500' },
    { id: 'kitabah', nameArabic: 'الْكِتَابَةُ', nameId: 'Menulis (Kitabah)', color: 'bg-amber-500' },
    { id: 'mufradat', nameArabic: 'الْمُفْرَدَاتُ', nameId: 'Kosakata (Mufradat)', color: 'bg-rose-500' },
  ];

  const overallAccuracy =
    stats.questionsAnswered > 0
      ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-600" />
          <span>Rapor & Hasil Belajar (تَقَدُّمُ التَّعَلُّمِ)</span>
        </h2>
        <p className="text-sm text-slate-600">
          Analisis penguasaan 5 keterampilan Bahasa Arab dan rekomendasi pengembangan belajar.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Tingkat Akurasi</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-emerald-600">{overallAccuracy}%</span>
            <span className="text-xs text-slate-400">rata-rata</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${overallAccuracy}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Soal Terjawab</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-800">{stats.questionsAnswered}</span>
            <span className="text-xs text-slate-400">soal</span>
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-2">
            {stats.questionsCorrect} benar ({stats.questionsAnswered - stats.questionsCorrect} salah)
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Level Petualang</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-amber-600">Lvl {stats.level}</span>
          </div>
          <p className="text-xs text-amber-700 font-semibold mt-2">
            {stats.totalScore} total skor akumulasi
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Tema Terbuka</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-indigo-600">{stats.unlockedThemes.length}</span>
            <span className="text-xs text-slate-400">dari 8 tema</span>
          </div>
          <p className="text-xs text-indigo-600 font-semibold mt-2">
            {stats.collectedWordIds.length} mufrodat dikuasai
          </p>
        </div>
      </div>

      {/* 5 Maharah Arabic Skills Performance */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          <span>Penguasaan 5 Maharah (Keterampilan Berbahasa Arab)</span>
        </h3>

        <div className="space-y-4">
          {skillsList.map((skill) => {
            const skillData = stats.skillStats[skill.id] || { total: 0, correct: 0 };
            const percentage =
              skillData.total > 0
                ? Math.round((skillData.correct / skillData.total) * 100)
                : 0;

            return (
              <div key={skill.id} className="space-y-1.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-arabic font-bold text-base text-amber-900">
                      {skill.nameArabic}
                    </span>
                    <span className="font-bold text-slate-800">• {skill.nameId}</span>
                  </div>
                  <span className="font-black text-slate-700">
                    {skillData.correct}/{skillData.total} ({percentage}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${skill.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(percentage, skillData.total === 0 ? 5 : percentage)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Recommendation Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-200" />
          <h3 className="font-extrabold text-lg text-yellow-100">
            Nasihat & Tips Guru Bahasa Arab
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-amber-50">
          "مَنْ جَدَّ وَجَدَ (Barangsiapa yang bersungguh-sungguh, dia akan berhasil). 
          Perbanyak latihan mendengarkan (Istima') dengan menekan tombol audio di Vocabulary Book, 
          dan hafalkan kosakata penting dari tema perkenalan dan sekolah agar nilai kelulusan petualanganmu mencapai Mumtaz!"
        </p>
      </div>
    </div>
  );
};
