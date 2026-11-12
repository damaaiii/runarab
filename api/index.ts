import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize GoogleGenAI server-side with mandatory User-Agent
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    game: 'Rihlatul Mughamarah',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/generate-quiz
 * Generates an educational Arabic question tailored to theme, skill, and difficulty
 */
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  const {
    theme = 'taaruf',
    skill = 'mufradat',
    difficulty = 'mudah',
    previousQuestionIds = [],
  } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      source: 'fallback_offline',
      message: 'Gemini API not configured, using local question bank',
      data: null,
    });
  }

  const prompt = `Anda adalah seorang guru pakar Bahasa Arab untuk siswa SMP/MTs (kelas VII-IX).
Buatlah SATU soal tantangan Bahasa Arab interaktif untuk game endless runner "Rihlatul Mughamarah".
Ketentuan:
- Tema: ${theme}
- Keterampilan bahasa (Maharah): ${skill} (Pilihannya: istima [menyimak], kalam [berbicara], qiraah [membaca teks pendek], kitabah [menulis / susun huruf], mufradat [kosakata])
- Tingkat kesulitan: ${difficulty} (mudah, sedang, atau sulit)
- Gunakan bahasa Arab yang fushah, WAJIB berharakat lengkap (tashkeel) pada teks bacaan/soal.
- Sediakan terjemahan bahasa Indonesia yang jelas.
- Berikan 4 pilihan jawaban yang mendidik, dengan 1 jawaban benar.
- Sertakan penjelasan edukatif (syarh) singkat dan ramah untuk siswa remaja.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionArabic: {
              type: Type.STRING,
              description: 'Teks soal dalam Bahasa Arab dengan harakat lengkap',
            },
            questionIndonesian: {
              type: Type.STRING,
              description: 'Petunjuk atau terjemahan soal dalam Bahasa Indonesia',
            },
            passageArabic: {
              type: Type.STRING,
              description: 'Teks bacaan pendek berharakat jika skill qiraah, atau kosong',
            },
            audioTextArabic: {
              type: Type.STRING,
              description: 'Teks bahasa Arab berharakat untuk dilafalkan audio (terutama istima)',
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4 pilihan jawaban (A, B, C, D)',
            },
            correctAnswerIndex: {
              type: Type.INTEGER,
              description: 'Index jawaban yang benar (0, 1, 2, atau 3)',
            },
            correctAnswerText: {
              type: Type.STRING,
              description: 'Teks jawaban yang benar',
            },
            explanation: {
              type: Type.STRING,
              description: 'Penjelasan tata bahasa atau arti kata kenapa jawaban tersebut benar',
            },
            vocabularyNote: {
              type: Type.STRING,
              description: 'Catatan mufrodat penting terkait soal',
            },
          },
          required: [
            'questionArabic',
            'questionIndonesian',
            'options',
            'correctAnswerIndex',
            'correctAnswerText',
            'explanation',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini_ai',
      data: {
        id: `ai_${Date.now()}`,
        themeId: theme,
        skill: skill,
        quizType: skill === 'istima' ? 'listening' : skill === 'qiraah' ? 'reading_comprehension' : 'multiple_choice',
        difficulty: difficulty,
        ...parsed,
      },
    });
  } catch (error: any) {
    console.error('Gemini generate-quiz error:', error?.message || error);
    return res.json({
      success: true,
      source: 'fallback_error',
      message: 'Gemini request encountered an issue, fallback will be used',
      data: null,
    });
  }
});

/**
 * POST /api/check-answer
 * Validates player answer and returns pedagogical advice
 */
app.post('/api/check-answer', async (req: Request, res: Response) => {
  const { questionArabic, userAnswer, correctAnswer, skill } = req.body;

  const isCorrect = userAnswer?.trim() === correctAnswer?.trim();

  // If Gemini is available, provide deeper contextual feedback
  if (ai && process.env.GEMINI_API_KEY && !isCorrect) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Dalam latihan Bahasa Arab siswa SMP/MTs (skill: ${skill}):
Soal: "${questionArabic}"
Jawaban siswa: "${userAnswer}"
Jawaban benar: "${correctAnswer}"
Berikan tips ramah 1-2 kalimat dalam bahasa Indonesia mengapa jawaban itu kurang tepat dan tips mengingatnya dengan mudah.`,
      });

      return res.json({
        isCorrect: false,
        aiFeedback: response.text,
      });
    } catch {
      // Fall through to basic response
    }
  }

  return res.json({
    isCorrect,
    aiFeedback: isCorrect
      ? 'Mumtaz! Jawabanmu sangat tepat! Terus tingkatkan kemampuan bahasa Arabmu.'
      : `Jawaban yang benar adalah: ${correctAnswer}. Tetap semangat dan pelajari lagi kosakatanya!`,
  });
});

/**
 * POST /api/learning-feedback
 * Generates personalized teacher feedback based on run performance
 */
app.post('/api/learning-feedback', async (req: Request, res: Response) => {
  const { playerName, score, accuracy, totalAnswered, correctCount, skillScores, themeTitle } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      feedback: {
        greeting: `Ahlan wa Sahlan, ${playerName || 'Petualang'}!`,
        appraisal:
          accuracy >= 80
            ? 'Mumtaz Jiddan! Penguasaan Bahasa Arab kamu luar biasa!'
            : accuracy >= 50
            ? 'Jayyid Jiddan! Kemampuanmu sudah baik, teruskan latihanmu.'
            : 'Laa Tahzan! Belajar Bahasa Arab butuh konsistensi. Mari coba lagi!',
        strengths: 'Kamu sangat bersemangat mengumpulkan koin ilmu dan kosakata baru.',
        recommendation: `Buka terus Vocabulary Book pada tema ${themeTitle || 'Bahasa Arab'} untuk memperkaya hafalan mufrodatmu.`,
      },
    });
  }

  const prompt = `Anda adalah Ustadz / Guru Pembimbing Bahasa Arab SMP/MTs yang hangat dan menyemangati.
Berikan rekap hasil evaluasi petualangan belajar untuk siswa bernama "${playerName || 'Siswa'}":
- Tema yang dimainkan: ${themeTitle || 'Bahasa Arab SMP'}
- Total skor: ${score}
- Akurasi kuis: ${accuracy}% (${correctCount} benar dari ${totalAnswered} soal)
- Rincian skill: ${JSON.stringify(skillScores || {})}

Berikan respon JSON terstruktur:
1. greeting (salam Islami/Arab dan sapaan ramah)
2. appraisal (apresiasi performa lari dan ketepatan menjawab)
3. strengths (aspek bahasa yang sudah dikuasai siswa dengan baik)
4. recommendation (saran latihan spesifik berikutnya agar semakin mahir)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            appraisal: { type: Type.STRING },
            strengths: { type: Type.STRING },
            recommendation: { type: Type.STRING },
          },
          required: ['greeting', 'appraisal', 'strengths', 'recommendation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      feedback: parsed,
    });
  } catch (err: any) {
    console.error('Error in learning-feedback endpoint:', err?.message || err);
    return res.json({
      success: true,
      feedback: {
        greeting: `Marhaban, ${playerName || 'Pejuang Bahasa Arab'}!`,
        appraisal: `Kamu berhasil meraih skor ${score} dengan akurasi ${accuracy}%. Usaha yang sangat bagus!`,
        strengths: 'Kemampuanmu merespons kuis di tengah rintangan lari patut diacungi jempol.',
        recommendation: 'Pelajari kembali kosakata di menu Vocabulary Book dan mainkan tema berikutnya!',
      },
    });
  }
});

export default app;
