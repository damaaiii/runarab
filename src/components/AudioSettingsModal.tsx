import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { Volume2, VolumeX, Music, Bell, X, Check } from 'lucide-react';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState(audioService.getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(audioService.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMusic = () => {
    audioService.toggleMusic();
    setSettings(audioService.getSettings());
  };

  const handleToggleSfx = () => {
    audioService.toggleSfx();
    setSettings(audioService.getSettings());
  };

  const handleToggleMute = () => {
    audioService.toggleMute();
    setSettings(audioService.getSettings());
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioService.setMusicVolume(val);
    setSettings(audioService.getSettings());
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioService.setSfxVolume(val);
    setSettings(audioService.getSettings());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl shadow-2xl border-2 border-amber-300 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-amber-700" />
            <h3 className="font-bold text-xl text-amber-950">Pengaturan Audio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Mute */}
        <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            {settings.isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            )}
            <div>
              <p className="font-semibold text-slate-800">Senyapkan Semua Suara</p>
              <p className="text-xs text-slate-500">Mute audio seketika</p>
            </div>
          </div>
          <button
            onClick={handleToggleMute}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              settings.isMuted
                ? 'bg-rose-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {settings.isMuted ? 'Muted' : 'Aktif'}
          </button>
        </div>

        {/* Music Control */}
        <div className="space-y-3 p-3 bg-white/80 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-slate-800">Musik Petualangan (BGM)</span>
            </div>
            <button
              onClick={handleToggleMusic}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                settings.musicEnabled && !settings.isMuted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {settings.musicEnabled && !settings.isMuted ? 'ON' : 'OFF'}
            </button>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Volume Musik</span>
              <span>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={handleMusicVolumeChange}
              disabled={!settings.musicEnabled || settings.isMuted}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        {/* SFX Control */}
        <div className="space-y-3 p-3 bg-white/80 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-slate-800">Efek Suara (SFX)</span>
            </div>
            <button
              onClick={handleToggleSfx}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                settings.sfxEnabled && !settings.isMuted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {settings.sfxEnabled && !settings.isMuted ? 'ON' : 'OFF'}
            </button>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Volume Efek</span>
              <span>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={handleSfxVolumeChange}
              disabled={!settings.sfxEnabled || settings.isMuted}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Terapkan Pengaturan</span>
        </button>
      </div>
    </div>
  );
};
