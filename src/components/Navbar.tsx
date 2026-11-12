import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, Coins, Award, ArrowLeft } from 'lucide-react';
import { audioService } from '../services/audioService';
import { AudioSettingsModal } from './AudioSettingsModal';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  coins?: number;
  level?: number;
  showBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  coins = 0,
  level = 1,
  showBack = false,
}) => {
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(audioService.getSettings().isMuted);

  const handleQuickMute = () => {
    audioService.toggleMute();
    setIsMuted(audioService.getSettings().isMuted);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-amber-600/95 backdrop-blur-md text-white shadow-md border-b-2 border-amber-500 safe-pt">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Left: Back or Brand */}
          <div className="flex items-center gap-2.5">
            {showBack && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-1.5 rounded-lg bg-amber-700/60 hover:bg-amber-700 active:scale-95 transition-all cursor-pointer"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => onNavigate('dashboard')}
              className="text-left flex flex-col cursor-pointer"
            >
              <span className="font-arabic text-lg sm:text-xl font-black text-amber-100 tracking-wide drop-shadow-sm leading-tight">
                رِحْلَةُ الْمُغَامَرَةِ
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-amber-200 tracking-wider hidden sm:inline uppercase">
                Arabic Learning Adventure
              </span>
            </button>
          </div>

          {/* Center/Right: Badges & Audio Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Level Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-700/80 rounded-full text-xs font-bold shadow-inner">
              <Award className="w-4 h-4 text-amber-300" />
              <span className="hidden xs:inline">Level</span>
              <span>{level}</span>
            </div>

            {/* Coins Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-800/80 rounded-full text-xs font-bold text-yellow-300 shadow-inner">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{coins}</span>
            </div>

            {/* Quick Audio Mute */}
            <button
              onClick={handleQuickMute}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-700 text-white'
                  : 'bg-amber-700/60 hover:bg-amber-700 text-amber-100'
              }`}
              title={isMuted ? 'Suara dimatikan' : 'Matikan suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Audio Settings Dialog */}
            <button
              onClick={() => setShowAudioSettings(true)}
              className="p-2 rounded-lg bg-amber-700/60 hover:bg-amber-700 text-amber-100 transition-all cursor-pointer"
              title="Pengaturan Audio"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <AudioSettingsModal
        isOpen={showAudioSettings}
        onClose={() => {
          setShowAudioSettings(false);
          setIsMuted(audioService.getSettings().isMuted);
        }}
      />
    </>
  );
};
