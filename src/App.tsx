import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LevelSelectPage } from './pages/LevelSelectPage';
import { GameplayPage } from './pages/GameplayPage';
import { VocabularyBookPage } from './pages/VocabularyBookPage';
import { LearningProgressPage } from './pages/LearningProgressPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { ArabicTheme } from './types/game';
import { ARABIC_THEMES } from './data/arabicData';
import { audioService } from './services/audioService';

type ViewMode =
  | 'landing'
  | 'dashboard'
  | 'level-select'
  | 'gameplay'
  | 'vocabulary'
  | 'progress'
  | 'leaderboard'
  | 'profile';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [selectedTheme, setSelectedTheme] = useState<ArabicTheme>(ARABIC_THEMES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'mudah' | 'sedang' | 'sulit'>('mudah');

  const { stats, updateProfile, addRunResults, recordSkillAttempt, resetProgress } = useGameState();

  const handleStartFromLanding = () => {
    setCurrentView('dashboard');
  };

  const handleSelectThemeAndPlay = (
    theme: ArabicTheme,
    difficulty: 'mudah' | 'sedang' | 'sulit'
  ) => {
    setSelectedTheme(theme);
    setSelectedDifficulty(difficulty);
    setCurrentView('gameplay');
  };

  const handleQuickPlay = () => {
    // Pick first unlocked theme
    const theme =
      ARABIC_THEMES.find((t) => stats.unlockedThemes.includes(t.id)) || ARABIC_THEMES[0];
    handleSelectThemeAndPlay(theme, 'mudah');
  };

  const navigateTo = (view: string) => {
    audioService.userInteracted();
    setCurrentView(view as ViewMode);
  };

  // If currently on landing page, display hero landing
  if (currentView === 'landing') {
    return <LandingPage onStart={handleStartFromLanding} />;
  }

  // If currently in gameplay, display full screen runner
  if (currentView === 'gameplay') {
    return (
      <GameplayPage
        theme={selectedTheme}
        difficulty={selectedDifficulty}
        playerName={stats.name}
        onBackToMenu={() => setCurrentView('dashboard')}
        onViewProgress={() => setCurrentView('progress')}
        onSaveRun={addRunResults}
        onRecordSkill={recordSkillAttempt}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        coins={stats.coins}
        level={stats.level}
        showBack={currentView !== 'dashboard'}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {currentView === 'dashboard' && (
          <DashboardPage
            stats={stats}
            onNavigate={navigateTo}
            onQuickPlay={handleQuickPlay}
          />
        )}

        {currentView === 'level-select' && (
          <LevelSelectPage
            playerLevel={stats.level}
            unlockedThemes={stats.unlockedThemes}
            onSelectTheme={handleSelectThemeAndPlay}
          />
        )}

        {currentView === 'vocabulary' && (
          <VocabularyBookPage collectedWordIds={stats.collectedWordIds} />
        )}

        {currentView === 'progress' && (
          <LearningProgressPage stats={stats} />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardPage stats={stats} />
        )}

        {currentView === 'profile' && (
          <ProfileSettingsPage
            stats={stats}
            onUpdateProfile={updateProfile}
            onResetProgress={resetProgress}
          />
        )}
      </main>
    </div>
  );
}
