'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Send, Bot, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { scales } from '@/lib/scales';

function AssessmentContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const scaleId = params.scaleId as string;
  const patientId = searchParams.get('patientId');
  
  const scale = scales.find(s => s.id === scaleId);
  
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是您的 AI 医生助手。在填写量表的过程中，如果您对任何题目有疑问，都可以随时问我。我会用通俗易懂的语言为您解答。' }
  ]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (!scale) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">未找到该量表</h2>
        <button 
          onClick={() => router.back()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          返回
        </button>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessages = [...messages, { role: 'user', content: chatInput }];
    setMessages(newMessages);
    setChatInput('');
    setIsLoading(true);

    try {
      const systemPrompt = `你现在是一位拥有20年临床经验的发育行为儿科主治医师，并且是一位极具同理心的沟通专家。你的核心任务是辅助患儿家属完成医学量表的填写。
1. 当家属对某道题目产生困惑时，请用不超过小学六年级的阅读理解难度进行解释，并提供生活化的场景类比。
2. 严禁使用任何专业医学词汇，严禁直接给出诊断结论。
3. 如果识别到家属的回答存在前后逻辑矛盾，请以温和、不带指责的语气进行追问和澄清。`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages.slice(1).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content })),
          systemPrompt,
          contextMessage: chatInput
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: 'assistant', content: data.text }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '抱歉，我现在遇到了一点问题，请稍后再试。' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: '抱歉，网络似乎出了点问题。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAssessment = async () => {
    alert('评估已提交！(此为演示功能)');
    router.push('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Panel: Assessment Form */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto border-r border-slate-200 bg-white">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          返回选择量表
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-2 uppercase">
          {scale.name}
        </h1>
        <p className="text-slate-600 mb-8">
          {scale.description}
        </p>

        <div className="space-y-8">
          {scale.questions.map((q, index) => (
            <div key={q.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                {index + 1}. {q.text}
              </h3>
              <div className="flex flex-wrap gap-4">
                {(q.reverse && scale.reverseOptions ? scale.reverseOptions : scale.options || []).map((opt) => (
                  <label key={opt.value} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors flex-1 min-w-[120px] ${
                    answers[q.id.toString()] === opt.value 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}>
                    <input 
                      type="radio" 
                      name={`q-${q.id}`} 
                      value={opt.value} 
                      checked={answers[q.id.toString()] === opt.value}
                      onChange={() => handleAnswerChange(q.id.toString(), opt.value)}
                      className="text-indigo-600 focus:ring-indigo-500" 
                    />
                    <span className="ml-3 text-slate-700 font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <button
            onClick={handleSubmitAssessment}
            disabled={Object.keys(answers).length < scale.questions.length}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-sm transition-colors"
          >
            {Object.keys(answers).length < scale.questions.length 
              ? `请完成所有题目 (${Object.keys(answers).length}/${scale.questions.length})` 
              : '提交评估结果'}
          </button>
        </div>
      </div>

      {/* Right Panel: AI Assistant */}
      <div className="w-full md:w-96 bg-slate-50 flex flex-col h-screen sticky top-0">
        <div className="p-4 bg-white border-b border-slate-200 flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">AI 医生助手</h2>
            <p className="text-xs text-slate-500">为您解答量表填写疑问</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="输入您对题目的疑问..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}>
      <AssessmentContent />
    </Suspense>
  );
}
