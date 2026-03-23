'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  currentAnswerLabel?: string;
  childInfo?: { name: string; age: number; basicInfo: string };
  scaleContext?: string;
  skillContext?: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const SYSTEM_PROMPT = `你现在是一位拥有20年临床经验的发育行为儿科主治医师，并且是一位极具同理心的沟通专家。你的核心任务是辅助患儿家属完成医学量表的填写。
1. 当家属对某道题目产生困惑时，请用不超过小学六年级的阅读理解难度进行解释，并提供生活化的场景类比。
2. 严禁使用任何专业医学词汇，严禁直接给出诊断结论。
3. 如果识别到家属的回答存在前后逻辑矛盾，请以温和、不带指责的语气进行追问和澄清。`;

export default function ChatAssistant({ isOpen, onClose, questionText, currentAnswerLabel, childInfo, scaleContext, skillContext }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Reset chat when question changes or modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content: `您好！我是您的 AI 医生助手。关于这道题：“${questionText}”，您有什么疑问吗？或者您可以告诉我${childInfo ? childInfo.name : '孩子'}平时的具体表现，我来帮您参考。`
        }
      ]);
    }
  }, [isOpen, questionText, messages.length, childInfo]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Provide context to the model silently
      let contextMessage = `当前正在填写的题目是：“${questionText}”。家长目前选择的答案是：${currentAnswerLabel || '尚未选择'}。`;
      if (scaleContext) {
        contextMessage += `\n量表背景信息：${scaleContext}\n`;
      }
      if (skillContext) {
        contextMessage += `\n【专业解释规范与参考资料 (Skill)】\n${skillContext}\n`;
      }
      if (childInfo) {
        contextMessage += `孩子的姓名是：${childInfo.name}，年龄：${childInfo.age}岁。`;
        if (childInfo.basicInfo) {
          contextMessage += `家长的补充说明：${childInfo.basicInfo}。`;
        }
      }
      contextMessage += `\n家长说：“${userMessage}”。请根据系统指令回复家长。`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages, // Send previous history
          systemPrompt: SYSTEM_PROMPT,
          contextMessage: contextMessage,
        }),
      });

      if (!res.ok) {
        throw new Error('AI 请求失败');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', content: data.text || '抱歉，我暂时无法回答。' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: '抱歉，网络似乎有点问题，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">AI 医生助手</h3>
                  <p className="text-xs text-slate-500">专业、温暖、耐心</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm'
                    }`}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <div className="prose prose-sm prose-indigo max-w-none">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] gap-3 flex-row">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 bg-white border border-slate-200 text-indigo-600 flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 rounded-2xl bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-indigo-600" />
                      <span className="text-sm text-slate-500">医生正在思考...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1 pr-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="描述孩子的具体表现..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-400 transition-colors flex-shrink-0"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
