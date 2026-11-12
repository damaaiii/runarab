import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types/game';
import { audioService } from '../services/audioService';
import { Volume2, CheckCircle2, XCircle, Clock, Sparkles, BookOpen, ChevronRight, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  question: QuizQuestion;
  onAnswerComplete: (isCorrect: boolean) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ question, onAnswerComplete }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [arrangedLetters, setArrangedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Initialize for word arrangement if applicable
  useEffect(() => {
    if (question.quizType === 'word_arrangement' && question.scrambledLetters) {
      setAvailableLetters([...question.scrambledLetters]);
      setArrangedLetters([]);
    }

    // Auto-play audio for Istima' questions
    if (question.skill === 'istima' && question.audioTextArabic) {
      handlePlayAudio();
    }
  }, [question]);

  // Countdown timer
  useEffect(() => {
    if (isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

  const handlePlayAudio = async () => {
    const textToSpeak = question.audioTextArabic || question.questionArabic;
    setIsPlayingAudio(true);
    await audioService.speakArabic(textToSpeak);
    setIsPlayingAudio(false);
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    setIsCorrect(false);
    audioService.playSfx('wrong');
  };

  const checkMultipleChoice = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const correct = index === question.correctAnswerIndex;
    setIsCorrect(correct);

    if (correct) {
      audioService.playSfx('correct');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      audioService.playSfx('wrong');
    }
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (isAnswered) return;
    const newAvailable = [...availableLetters];
    newAvailable.splice(index, 1);
    setAvailableLetters(newAvailable);
    setArrangedLetters([...arrangedLetters, letter]);
  };

  const handleUndoLetter = (index: number) => {
    if (isAnswered) return;
    const letter = arrangedLetters[index];
    const newArranged = [...arrangedLetters];
    newArranged.splice(index, 1);
    setArrangedLetters(newArranged);
    setAvailableLetters([...availableLetters, letter]);
  };

  const submitWordArrangement = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    const joined = arrangedLetters.join('');
    // Remove harakat from target for matching flexibility if needed
    const correct =
      joined === question.targetWordArabic?.replace(/[ً-ْ]/g, '') ||
      arrangedLetters.join('') === question.correctAnswerText;

    setIsCorrect(correct);
    if (correct) {
      audioService.playSfx('correct');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      audioService.playSfx('wrong');
    }
  };

  const handleContinue = () => {
    onAnswerComplete(isCorrect);
  };

  const skillBadge = {
    istima: { label: "الِاسْتِمَاعُ (Istima')", color: 'bg-blue-600 text-blue-50' },
    kalam: { label: "الْكَلَامُ (Kalam)", color: 'bg-emerald-600 text-emerald-50' },
    qiraah: { label: "الْقِرَاءَةُ (Qira'ah)", color: 'bg-purple-600 text-purple-50' },
    kitabah: { label: "الْكِتَابَةُ (Kitabah)", color: 'bg-amber-600 text-amber-50' },
    mufradat: { label: "الْمُفْرَدَاتُ (Mufradat)", color: 'bg-rose-600 text-rose-50' },
  }[question.skill] || { label: 'Bahasa Arab', color: 'bg-indigo-600 text-indigo-50' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${skillBadge.color} shadow-sm`}>
              {skillBadge.label}
            </span>
            <span className="text-xs uppercase font-semibold tracking-wider text-amber-100 bg-black/20 px-2 py-0.5 rounded">
              Tingkat: {question.difficulty}
            </span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-sm font-bold shadow-inner ${
            timeLeft <= 5 ? 'bg-red-600 animate-pulse text-white' : 'bg-amber-900/40 text-amber-100'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Qira'ah Passage (if present) */}
          {question.passageArabic && (
            <div className="bg-amber-100/80 border-r-4 border-amber-500 rounded-lg p-3.5 text-right font-arabic text-xl sm:text-2xl text-slate-800 leading-relaxed shadow-sm">
              <div className="flex items-center justify-end gap-1.5 text-xs text-amber-700 font-sans mb-1 font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>نَصُّ الْقِرَاءَةِ (Teks Bacaan):</span>
              </div>
              {question.passageArabic}
            </div>
          )}

          {/* Audio Button for Istima' */}
          {question.audioTextArabic && (
            <div className="flex justify-center my-2">
              <button
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-semibold shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                <span>{isPlayingAudio ? 'Mendengarkan...' : 'Putar Audio Bahasa Arab'}</span>
                <RefreshCw className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          )}

          {/* Main Question Box */}
          <div className="text-center space-y-2">
            <h3 className="font-arabic text-2xl sm:text-3xl font-bold text-amber-950 leading-relaxed drop-shadow-sm">
              {question.questionArabic}
            </h3>
            <p className="text-sm sm:text-base font-medium text-slate-700">
              {question.questionIndonesian}
            </p>
          </div>

          {/* QUESTION TYPE: WORD ARRANGEMENT (KITABAH) */}
          {question.quizType === 'word_arrangement' && question.scrambledLetters && (
            <div className="space-y-4 py-2">
              {/* Target slot */}
              <div className="flex flex-row-reverse justify-center items-center gap-2 p-3 bg-white/90 rounded-xl border-2 border-dashed border-amber-400 min-h-[64px]">
                {arrangedLetters.length === 0 ? (
                  <span className="text-slate-400 text-sm italic">Ketuk huruf di bawah untuk menyusun</span>
                ) : (
                  arrangedLetters.map((letter, idx) => (
                    <button
                      key={`arranged-${idx}`}
                      onClick={() => handleUndoLetter(idx)}
                      disabled={isAnswered}
                      className="w-12 h-12 bg-amber-500 text-white font-arabic text-2xl font-bold rounded-lg shadow-md hover:bg-amber-600 active:scale-95 flex items-center justify-center transition-transform"
                    >
                      {letter}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled letter pool */}
              <div className="flex flex-wrap justify-center gap-2.5">
                {availableLetters.map((letter, idx) => (
                  <button
                    key={`available-${idx}`}
                    onClick={() => handleLetterClick(letter, idx)}
                    disabled={isAnswered}
                    className="w-12 h-12 bg-white text-amber-900 border-2 border-amber-300 font-arabic text-2xl font-bold rounded-lg shadow hover:border-amber-500 hover:bg-amber-50 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {!isAnswered && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={submitWordArrangement}
                    disabled={arrangedLetters.length === 0}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg cursor-pointer transition-all"
                  >
                    Kirim Jawaban
                  </button>
                </div>
              )}
            </div>
          )}

          {/* QUESTION TYPE: MULTIPLE CHOICE & OTHERS */}
          {question.options && question.quizType !== 'word_arrangement' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {question.options.map((option, idx) => {
                let btnStyle = 'bg-white hover:bg-amber-50 border-amber-200 text-slate-800';

                if (isAnswered) {
                  if (idx === question.correctAnswerIndex) {
                    btnStyle = 'bg-emerald-600 border-emerald-700 text-white shadow-lg ring-2 ring-emerald-300';
                  } else if (selectedOption === idx) {
                    btnStyle = 'bg-rose-600 border-rose-700 text-white';
                  } else {
                    btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => checkMultipleChoice(idx)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 rounded-xl border-2 font-medium text-left transition-all flex items-center justify-between gap-3 shadow-sm active:scale-[0.98] cursor-pointer ${btnStyle}`}
                  >
                    <span className="flex-1 text-sm sm:text-base font-arabic-inline">
                      {option}
                    </span>
                    {isAnswered && idx === question.correctAnswerIndex && (
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                    )}
                    {isAnswered && selectedOption === idx && idx !== question.correctAnswerIndex && (
                      <XCircle className="w-5 h-5 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Explanation Box (Post Answer) */}
          {isAnswered && (
            <div className={`p-4 rounded-xl border-2 space-y-2 animate-fadeIn ${
              isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-950' : 'bg-rose-50 border-rose-400 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold text-base">
                {isCorrect ? (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Mumtaz! Jawaban Benar (+150 Poin, +15 Koin)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Afwan, Jawaban Belum Tepat!</span>
                  </>
                )}
              </div>

              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Penjelasan: </span>
                {question.explanation}
              </p>

              {question.vocabularyNote && (
                <div className="text-xs font-semibold px-2.5 py-1 bg-amber-200/60 text-amber-900 rounded-md inline-block">
                  💡 {question.vocabularyNote}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isAnswered && (
          <div className="p-3 bg-amber-100 border-t border-amber-300 flex justify-end">
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <span>Lanjutkan Petualangan</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
