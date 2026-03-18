'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import ChatAssistant from './ChatAssistant';
import { ChildProfile } from '@/hooks/use-profiles';
import { scales } from '@/lib/scales';

interface QuestionnaireProps {
  profile: ChildProfile;
  scaleId: string;
  onComplete: (answers: Record<number, number>, score: number) => void;
  onCancel: () => void;
}

export default function Questionnaire({ profile, scaleId, onComplete, onCancel }: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const scale = scales.find(s => s.id === scaleId) || scales[0];
  const questions = scale.questions;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  // Safeguard against out-of-bounds index
  if (!currentQuestion) {
    return null;
  }

  const currentOptions = currentQuestion.reverse && scale.reverseOptions ? scale.reverseOptions : scale.options;

  const handleOptionSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    // Auto-advance after a short delay if not the last question
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
      }, 400);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
    } else {
      setIsFinished(true);
      // Calculate total score considering weights if they exist
      const score = Object.entries(answers).reduce((total, [questionId, value]) => {
        const question = questions.find(q => q.id === Number(questionId));
        if (question && question.weight !== undefined && value > 0) {
          // If value is 1 (or greater), we multiply by weight. 
          // For ABC scale, value is 1 for 'Yes', so value * weight = weight.
          // For other scales without weight, it just adds the value.
          return total + (value * question.weight);
        }
        return total + value;
      }, 0);
      onComplete(answers, score);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 max-w-md mx-auto relative shadow-2xl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center w-full"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">填写完成</h2>
          <p className="text-slate-500 mb-8">感谢您的耐心配合，{profile.name} 的量表结果已记录。</p>
          <button 
            onClick={onCancel}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            返回档案列表
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Header & Progress */}
      <header className="pt-12 pb-6 px-6 bg-white z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={onCancel}
              className="p-1 -ml-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-medium text-slate-800">{scale.shortName}</h1>
          </div>
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-8 flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-semibold text-slate-800 leading-snug mb-8">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3 mb-8">
              {currentOptions.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-lg ${isSelected ? 'text-indigo-700 font-medium' : 'text-slate-700'}`}>
                      {option.label}
                    </span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-indigo-600' : 'border-slate-200'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI Help Button */}
            <div className="mt-auto mb-6">
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center gap-2 font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                <HelpCircle size={20} />
                <span>需要帮助 / 问 AI 医生</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <footer className="p-6 bg-white border-t border-slate-100 flex gap-4 z-10">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3.5 rounded-xl font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-40 disabled:bg-slate-50 bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <ChevronLeft size={20} />
          上一题
        </button>
        <button
          onClick={handleNext}
          disabled={answers[currentQuestion.id] === undefined}
          className="flex-1 py-3.5 rounded-xl font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {currentIndex === questions.length - 1 ? '提交' : '下一题'}
          {currentIndex !== questions.length - 1 && <ChevronRight size={20} />}
        </button>
      </footer>

      {/* Chat Modal */}
      <ChatAssistant 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        questionText={currentQuestion.text}
        currentAnswerLabel={answers[currentQuestion.id] !== undefined ? currentOptions.find(o => o.value === answers[currentQuestion.id])?.label : undefined}
        childInfo={profile}
        scaleContext={scale.aiPromptContext}
        skillContext={scale.skillContext}
      />
    </div>
  );
}
