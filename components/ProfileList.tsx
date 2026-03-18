'use client';

import { useState } from 'react';
import { ChildProfile, AssessmentResult } from '@/hooks/use-profiles';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, User, Calendar, FileText, ChevronRight, Edit2, Trash2, X, Info, Clock, Settings as SettingsIcon } from 'lucide-react';
import { scales } from '@/lib/scales';

interface ProfileListProps {
  profiles: ChildProfile[];
  results: AssessmentResult[];
  onAdd: () => void;
  onEdit: (profile: ChildProfile) => void;
  onDelete: (id: string) => void;
  onSelect: (profileId: string, scaleId: string) => void;
  onViewReport: (id: string) => void;
  onViewTimeline: (id: string) => void;
  onOpenSettings: () => void;
}

export default function ProfileList({ profiles, results, onAdd, onEdit, onDelete, onSelect, onViewReport, onViewTimeline, onOpenSettings }: ProfileListProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const handleStartAssessment = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  const handleScaleSelect = (scaleId: string) => {
    if (selectedProfileId) {
      onSelect(selectedProfileId, scaleId);
      setSelectedProfileId(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      <header className="pt-12 pb-6 px-6 bg-white z-10 relative border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">儿童档案</h1>
          <p className="text-slate-500 mt-1 text-sm">选择一个档案开始评估，或添加新档案</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          title="AI 设置"
        >
          <SettingsIcon size={20} />
        </button>
      </header>

      <main className="flex-1 px-6 py-6 overflow-y-auto">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-4">
              <User size={32} />
            </div>
            <p className="text-slate-500 mb-2">暂无儿童档案</p>
            <p className="text-sm text-slate-400">请先添加一个档案以开始评估</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map(profile => {
              const profileResults = results.filter(r => r.profileId === profile.id);
              const lastAssessment = profileResults.length > 0 
                ? new Date(Math.max(...profileResults.map(r => r.date))).toLocaleDateString()
                : '尚未评估';

              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-lg">
                        {profile.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-lg">{profile.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {profile.age} 岁</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(profile); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (window.confirm('确定要删除此档案吗？相关评估记录也将被删除。')) {
                            onDelete(profile.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {profile.basicInfo && (
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-medium text-slate-700">基本情况：</span>{profile.basicInfo}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText size={14} />
                      上次评估: {lastAssessment}
                    </div>
                    <div className="flex gap-3">
                      {profileResults.length > 0 && (
                        <>
                          <button
                            onClick={() => onViewTimeline(profile.id)}
                            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800"
                          >
                            <Clock size={14} />
                            时间线
                          </button>
                          <button
                            onClick={() => onViewReport(profile.id)}
                            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800"
                          >
                            查看报告
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleStartAssessment(profile.id)}
                        className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        开始评估 <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="p-6 bg-white border-t border-slate-100 z-10">
        <button
          onClick={onAdd}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          添加新档案
        </button>
      </footer>

      {/* Scale Selection Modal */}
      <AnimatePresence>
        {selectedProfileId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-semibold text-slate-800">选择评估量表</h2>
                <button 
                  onClick={() => setSelectedProfileId(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="bg-indigo-50 p-4 rounded-2xl text-sm leading-relaxed mb-6 border border-indigo-100/50">
                  <div className="flex items-center gap-1.5 font-medium text-indigo-800 mb-2">
                    <Info size={16} />
                    <span>为什么需要选择量表？</span>
                  </div>
                  <p className="text-indigo-700/90 mb-3">
                    儿童的发育行为涉及多个不同领域（如社交、注意力、情绪等）。为了提供更精准的评估和建议，我们需要使用专门针对特定领域的标准化量表。
                  </p>
                  <p className="font-medium text-indigo-800 mb-1">各量表主要用途：</p>
                  <ul className="list-disc pl-4 space-y-1 text-indigo-700/80">
                    <li><strong>简易社交量表：</strong>快速筛查基础社交互动能力。</li>
                    <li><strong>SRS量表：</strong>全面、深入评估社交障碍的严重程度。</li>
                    <li><strong>SNAP-IV量表：</strong>筛查注意力缺陷及多动/冲动行为。</li>
                    <li><strong>ABC量表：</strong>筛查和评估儿童孤独症的严重程度。</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  {scales.map(scale => (
                    <button
                      key={scale.id}
                      onClick={() => handleScaleSelect(scale.id)}
                      className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700">{scale.name}</h3>
                        <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-500" />
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{scale.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
