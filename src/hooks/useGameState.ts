import { useState, useEffect } from 'react';
import { PlayerStats, ArabicSkill } from '../types/game';
import { audioService } from '../services/audioService';

const STORAGE_KEY = 'rihla_player_data';

const DEFAULT_STATS: PlayerStats = {
  name: 'Petualang Muda',
  avatar: 'ahmad',
  totalScore: 0,
  coins: 50,
  level: 1,
  highScore: 0,
  totalRuns: 0,
  questionsAnswered: 0,
  questionsCorrect: 0,
  unlockedThemes: ['taaruf', 'madrasah'],
  collectedWordIds: ['voc_1', 'voc_2', 'voc_6', 'voc_7'],
  skillStats: {
    istima: { total: 0, correct: 0 },
    kalam: { total: 0, correct: 0 },
    qiraah: { total: 0, correct: 0 },
    kitabah: { total: 0, correct: 0 },
    mufradat: { total: 0, correct: 0 },
  },
  audioSettings: audioService.getSettings(),
};

export function useGameState() {
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  const updateProfile = (name: string, avatar: string) => {
    setStats((prev) => ({
      ...prev,
      name,
      avatar,
    }));
  };

  const addRunResults = (
    runScore: number,
    runCoins: number,
    quizzesAnswered: number,
    quizzesCorrect: number,
    newWords: string[]
  ) => {
    setStats((prev) => {
      const newTotalScore = prev.totalScore + runScore;
      const newHighScore = Math.max(prev.highScore, runScore);
      const newCoins = prev.coins + runCoins;
      const newRuns = prev.totalRuns + 1;
      const newQuestions = prev.questionsAnswered + quizzesAnswered;
      const newCorrect = prev.questionsCorrect + quizzesCorrect;

      // Calculate level based on total score (Level up every 1000 points)
      const calculatedLevel = Math.max(1, Math.floor(newTotalScore / 1000) + 1);

      // Unlock themes based on level
      const unlocked = [...prev.unlockedThemes];
      if (calculatedLevel >= 2) {
        if (!unlocked.includes('usrah')) unlocked.push('usrah');
        if (!unlocked.includes('mihnah')) unlocked.push('mihnah');
      }
      if (calculatedLevel >= 3) {
        if (!unlocked.includes('bait')) unlocked.push('bait');
        if (!unlocked.includes('hayawanat')) unlocked.push('hayawanat');
      }
      if (calculatedLevel >= 4) {
        if (!unlocked.includes('alwan')) unlocked.push('alwan');
        if (!unlocked.includes('amal_yaumiyyah')) unlocked.push('amal_yaumiyyah');
      }

      // Add newly collected words
      const mergedWords = Array.from(new Set([...prev.collectedWordIds, ...newWords]));

      return {
        ...prev,
        totalScore: newTotalScore,
        highScore: newHighScore,
        coins: newCoins,
        level: calculatedLevel,
        totalRuns: newRuns,
        questionsAnswered: newQuestions,
        questionsCorrect: newCorrect,
        unlockedThemes: unlocked,
        collectedWordIds: mergedWords,
      };
    });
  };

  const recordSkillAttempt = (skill: ArabicSkill, isCorrect: boolean) => {
    setStats((prev) => {
      const current = prev.skillStats[skill] || { total: 0, correct: 0 };
      return {
        ...prev,
        skillStats: {
          ...prev.skillStats,
          [skill]: {
            total: current.total + 1,
            correct: current.correct + (isCorrect ? 1 : 0),
          },
        },
      };
    });
  };

  const resetProgress = () => {
    setStats(DEFAULT_STATS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    stats,
    updateProfile,
    addRunResults,
    recordSkillAttempt,
    resetProgress,
  };
}
