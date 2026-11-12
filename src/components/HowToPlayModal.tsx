import React from 'react';
import { X, ArrowLeftRight, ArrowUp, ArrowDown, Shield, Magnet, Sparkles, BookOpen } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl shadow-2xl border-2 border-amber-300 p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div>
            <h3 className="font-bold text-xl text-amber-950">Petunjuk Permainan & Pembelajaran</h3>
            <p className="text-xs text-amber-700">Cara bermain "رِحْلَةُ الْمُغَامَرَةِ"</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Kontrol Permainan */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-sm uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
            Kontrol Karakter Runner (3 Jalur)
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Geser Jalur</p>
                <p className="text-xs text-slate-500">Panah Kiri/Kanan, A/D, atau Swipe Kiri/Kanan</p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Melompat</p>
                <p className="text-xs text-slate-500">Panah Atas, W, Spasi, atau Swipe Ke Atas</p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <ArrowDown className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Merunduk / Slide</p>
                <p className="text-xs text-slate-500">Panah Bawah, S, atau Swipe Ke Bawah</p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Perisai & Magnet</p>
                <p className="text-xs text-slate-500">Ambil bola kekuatan untuk perlindungan & koin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Integrasi 5 Keterampilan Bahasa Arab */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-sm uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
            5 Maharah (Keterampilan) Bahasa Arab
          </h4>
          <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-2 text-xs sm:text-sm text-slate-700 shadow-sm">
            <p>
              <strong className="text-blue-700">1. الاستماع (Istima'):</strong> Dengarkan pelafalan audio kosakata Arab, pilih arti kata yang tepat.
            </p>
            <p>
              <strong className="text-emerald-700">2. الكلام (Kalam):</strong> Selesaikan dialog percakapan sapaan dan tanya-jawab santun sehari-hari.
            </p>
            <p>
              <strong className="text-purple-700">3. القراءة (Qira'ah):</strong> Baca paragraf pendek berharakat dan jawab pertanyaan pemahaman.
            </p>
            <p>
              <strong className="text-amber-700">4. الكتابة (Kitabah):</strong> Susun huruf-huruf hijaiyah menjadi kata yang bermakna.
            </p>
            <p>
              <strong className="text-rose-700">5. المفردات (Mufradat):</strong> Tebak arti kosakata dan kumpulkan kartu kata di Vocabulary Book.
            </p>
          </div>
        </div>

        {/* Section 3: Skor & Bonus */}
        <div className="p-3 bg-amber-100/80 rounded-xl border border-amber-300 flex items-center gap-3 text-xs sm:text-sm">
          <Sparkles className="w-6 h-6 text-amber-600 shrink-0" />
          <p className="text-amber-900">
            <strong>Tips Guru:</strong> Setiap menjawab kuis dengan benar di tengah lari, kamu mendapatkan <strong>+150 Skor</strong>, <strong>+15 Koin</strong>, serta pelindung sementara!
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          Fahimtu (Saya Mengerti)
        </button>
      </div>
    </div>
  );
};
