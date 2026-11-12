import React, { useState } from 'react';
import { PlayerStats } from '../types/game';
import { audioService } from '../services/audioService';
import { Settings, User, Volume2, ShieldCheck, Check, RotateCcw, Sparkles } from 'lucide-react';

interface ProfileSettingsPageProps {
  stats: PlayerStats;
  onUpdateProfile: (name: string, avatar: string) => void;
  onResetProgress: () => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  stats,
  onUpdateProfile,
  onResetProgress,
}) => {
  const [name, setName] = useState(stats.name);
  const [avatar, setAvatar] = useState(stats.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Audio settings local state
  const [audioSettings, setAudioSettings] = useState(audioService.getSettings());

  const avatarsList = [
    { id: 'ahmad', label: 'Ahmad', emoji: '👳‍♂️', desc: 'Petualang Gurun' },
    { id: 'fatimah', label: 'Fatimah', emoji: '🧕', desc: 'Penjelajah Tangguh' },
    { id: 'sultan', label: 'Sultan', emoji: '👑', desc: 'Pemimpin Cendekia' },
    { id: 'alim', label: 'Alim', emoji: '🧑‍🎓', desc: 'Pencari Ilmu' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name.trim() || 'Petualang Muda', avatar);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAudioToggle = (type: 'music' | 'sfx' | 'mute') => {
    if (type === 'music') audioService.toggleMusic();
    if (type === 'sfx') audioService.toggleSfx();
    if (type === 'mute') audioService.toggleMute();
    setAudioSettings(audioService.getSettings());
  };

  const handleVolumeChange = (type: 'music' | 'sfx', val: number) => {
    if (type === 'music') audioService.setMusicVolume(val);
    if (type === 'sfx') audioService.setSfxVolume(val);
    setAudioSettings(audioService.getSettings());
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-600" />
          <span>Profil & Pengaturan (الْمَلَفُّ الشَّخْصِيُّ)</span>
        </h2>
        <p className="text-sm text-slate-600">
          Kelola profil petualang, avatar karakter, dan preferensi audio.
        </p>
      </div>

      {/* Profile Edit Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm space-y-5">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-amber-100 pb-3">
          <User className="w-5 h-5 text-amber-600" />
          <span>Identitas Karakter Petualang</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Choice */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Pilih Avatar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {avatarsList.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setAvatar(av.id)}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    avatar === av.id
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300'
                      : 'border-slate-200 hover:border-amber-200 bg-white'
                  }`}
                >
                  <span className="text-4xl">{av.emoji}</span>
                  <span className="font-extrabold text-sm text-slate-800">{av.label}</span>
                  <span className="text-[10px] text-slate-400">{av.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Nama Lengkap / Julukan Petualang
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              placeholder="Masukkan nama petualang..."
              className="w-full px-4 py-3 bg-amber-50/40 rounded-xl border border-amber-300 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Profil berhasil diperbarui!</span>
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Audio Preferences Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-amber-100 pb-3">
          <Volume2 className="w-5 h-5 text-amber-600" />
          <span>Pengaturan Suara & Musik</span>
        </h3>

        <div className="space-y-4 text-sm">
          {/* Music */}
          <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <div>
              <p className="font-bold text-slate-800">Musik Petualangan (BGM Timur Tengah)</p>
              <p className="text-xs text-slate-500">Instrumen Oud, Qanun & Darbuka</p>
            </div>
            <button
              onClick={() => handleAudioToggle('music')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                audioSettings.musicEnabled && !audioSettings.isMuted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {audioSettings.musicEnabled && !audioSettings.isMuted ? 'AKTIF' : 'NONAKTIF'}
            </button>
          </div>

          {/* SFX */}
          <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <div>
              <p className="font-bold text-slate-800">Efek Suara Permainan (SFX)</p>
              <p className="text-xs text-slate-500">Lompat, koin, merunduk, dan kuis</p>
            </div>
            <button
              onClick={() => handleAudioToggle('sfx')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                audioSettings.sfxEnabled && !audioSettings.isMuted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {audioSettings.sfxEnabled && !audioSettings.isMuted ? 'AKTIF' : 'NONAKTIF'}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="bg-rose-50/60 rounded-3xl p-5 sm:p-6 border-2 border-rose-200 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-rose-900 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-rose-600" />
          <span>Reset Progres Petualangan</span>
        </h3>
        <p className="text-xs text-slate-600">
          Tindakan ini akan mengembalikan level, skor, koin, dan statistik belajar ke kondisi awal.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Apakah kamu yakin ingin mereset seluruh progres permainan?')) {
              onResetProgress();
            }
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
        >
          Reset Seluruh Progres
        </button>
      </div>
    </div>
  );
};
