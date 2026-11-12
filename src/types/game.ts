export type ArabicSkill = 'istima' | 'kalam' | 'qiraah' | 'kitabah' | 'mufradat';

export interface ArabicTheme {
  id: string;
  titleArabic: string;
  titleIndonesian: string;
  description: string;
  icon: string;
  color: string;
  requiredLevel: number;
}

export type QuizType =
  | 'multiple_choice'
  | 'matching'
  | 'listening'
  | 'word_arrangement'
  | 'reading_comprehension'
  | 'vocabulary_challenge';

export interface QuizQuestion {
  id: string;
  themeId: string;
  skill: ArabicSkill;
  quizType: QuizType;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  questionArabic: string;
  questionIndonesian: string;
  passageArabic?: string; // For Qira'ah
  audioTextArabic?: string; // For Istima' speech synthesis
  scrambledLetters?: string[]; // For Kitabah word arrangement
  targetWordArabic?: string; // Target for Kitabah
  options?: string[]; // Array of 4 options
  correctAnswerIndex?: number;
  correctAnswerText: string;
  explanation: string;
  vocabularyNote?: string;
}

export interface VocabularyItem {
  id: string;
  themeId: string;
  wordArabic: string;
  transliteration: string;
  meaningIndonesian: string;
  category: string;
  audioText?: string;
  exampleSentenceArabic?: string;
  exampleSentenceIndonesian?: string;
  iconName?: string;
}

export interface PlayerStats {
  name: string;
  avatar: string;
  totalScore: number;
  coins: number;
  level: number;
  highScore: number;
  totalRuns: number;
  questionsAnswered: number;
  questionsCorrect: number;
  unlockedThemes: string[];
  collectedWordIds: string[];
  skillStats: {
    istima: { total: number; correct: number };
    kalam: { total: number; correct: number };
    qiraah: { total: number; correct: number };
    kitabah: { total: number; correct: number };
    mufradat: { total: number; correct: number };
  };
  audioSettings: {
    musicEnabled: boolean;
    sfxEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
}

export interface RunSummary {
  score: number;
  coins: number;
  distance: number;
  quizzesSolved: number;
  accuracy: number;
  themeId: string;
  newWordsUnlocked: string[];
}
