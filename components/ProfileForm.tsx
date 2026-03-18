'use client';

import { useState, useEffect } from 'react';
import { ChildProfile } from '@/hooks/use-profiles';
import { motion } from 'motion/react';
import { ChevronLeft, Save, User, Calendar, FileText } from 'lucide-react';

interface ProfileFormProps {
  initialData?: ChildProfile | null;
  onSave: (profile: ChildProfile) => void;
  onCancel: () => void;
}

export default function ProfileForm({ initialData, onSave, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [age, setAge] = useState(initialData?.age?.toString() || '');
  const [basicInfo, setBasicInfo] = useState(initialData?.basicInfo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) return;

    const profile: ChildProfile = {
      id: initialData?.id || Date.now().toString(),
      name: name.trim(),
      age: parseInt(age, 10),
      basicInfo: basicInfo.trim(),
      createdAt: initialData?.createdAt || Date.now(),
    };

    onSave(profile);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      <header className="pt-12 pb-6 px-6 bg-white z-10 relative border-b border-slate-100 flex items-center gap-4">
        <button 
          onClick={onCancel}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800">
          {initialData ? '编辑档案' : '添加新档案'}
        </h1>
      </header>

      <main className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <User size={16} className="text-indigo-500" /> 孩子姓名
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入孩子的姓名或昵称"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-500" /> 年龄 (岁)
            </label>
            <input
              id="age"
              type="number"
              required
              min="0"
              max="18"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="请输入孩子的年龄"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="basicInfo" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> 基本情况 (选填)
            </label>
            <textarea
              id="basicInfo"
              rows={4}
              value={basicInfo}
              onChange={(e) => setBasicInfo(e.target.value)}
              placeholder="例如：平时比较安静，对某些声音敏感，喜欢玩车轮等..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-slate-800 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              这些信息将帮助 AI 医生助手更好地理解孩子的情况，提供更准确的建议。
            </p>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={!name.trim() || !age.trim()}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-400"
            >
              <Save size={20} />
              保存档案
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
