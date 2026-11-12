import { QuizQuestion, ArabicSkill } from '../types/game';
import { CURATED_QUESTIONS } from '../data/arabicData';

export async function fetchQuizQuestion(
  themeId: string,
  skill: ArabicSkill,
  difficulty: 'mudah' | 'sedang' | 'sulit'
): Promise<QuizQuestion> {
  try {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: themeId, skill, difficulty }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn('API call to /api/generate-quiz failed, using local question bank:', err);
  }

  // Local fallback: pick matching question from curated bank
  const matching = CURATED_QUESTIONS.filter(
    (q) => q.themeId === themeId && (q.skill === skill || true)
  );

  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }

  // General random fallback
  return CURATED_QUESTIONS[Math.floor(Math.random() * CURATED_QUESTIONS.length)];
}

export async function fetchLearningFeedback(stats: {
  playerName: string;
  score: number;
  accuracy: number;
  totalAnswered: number;
  correctCount: number;
  skillScores: any;
  themeTitle?: string;
}) {
  try {
    const res = await fetch('/api/learning-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.feedback) {
        return data.feedback;
      }
    }
  } catch (err) {
    console.warn('Feedback API call failed, using default feedback:', err);
  }

  return {
    greeting: `Ahlan wa Sahlan, ${stats.playerName}!`,
    appraisal:
      stats.accuracy >= 75
        ? 'Mumtaz Jiddan! Penguasaan Bahasa Arab kamu sangat mengagumkan.'
        : 'Usaha yang luar biasa! Terus berlatih agar semakin fasih berbahasa Arab.',
    strengths: 'Ketangkasan dalam berlari dan menjawab kuis terus berkembang.',
    recommendation: 'Buka Vocabulary Book untuk mengulang kosakata yang baru kamu temui.',
  };
}
