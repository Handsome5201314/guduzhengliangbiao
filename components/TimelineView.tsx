'use client';

import { useState, useMemo } from 'react';
import { ChildProfile, AssessmentResult } from '@/hooks/use-profiles';
import { ChevronLeft, ChevronRight, Calendar, Clock, Filter, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { scales } from '@/lib/scales';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  profile: ChildProfile;
  results: AssessmentResult[];
  onViewResult: (result: AssessmentResult) => void;
  onBack: () => void;
}

type TimeFilter = 'all' | 'week' | 'month' | 'quarter' | 'year';

export default function TimelineView({ profile, results, onViewResult, onBack }: TimelineViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('all');
  const [selectedScaleId, setSelectedScaleId] = useState<string | 'all'>('all');

  const filteredResults = useMemo(() => {
    let filtered = [...results].sort((a, b) => b.date - a.date);

    if (selectedScaleId !== 'all') {
      filtered = filtered.filter(r => r.scaleId === selectedScaleId);
    }

    const now = Date.now();
    const filterTime = selectedFilter === 'week' ? 7 * 24 * 60 * 60 * 1000 :
                       selectedFilter === 'month' ? 30 * 24 * 60 * 60 * 1000 :
                       selectedFilter === 'quarter' ? 90 * 24 * 60 * 60 * 1000 :
                       selectedFilter === 'year' ? 365 * 24 * 60 * 60 * 1000 : 0;

    if (filterTime > 0) {
      filtered = filtered.filter(r => r.date >= now - filterTime);
    }

    return filtered;
  }, [results, selectedFilter, selectedScaleId]);

  const timelineData = useMemo(() => {
    const grouped: Record<string, AssessmentResult[]> = {};
    
    filteredResults.forEach(result => {
      const date = new Date(result.date);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(result);
    });

    return Object.entries(grouped)
      .map(([date, results]) => ({ date, results: results.sort((a, b) => b.date - a.date) }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredResults]);

  const getTrend = (scaleId: string) => {
    const scaleResults = filteredResults.filter(r => r.scaleId === scaleId).sort((a, b) => a.date - b.date);
    if (scaleResults.length < 2) return null;

    const first = scaleResults[0].score;
    const last = scaleResults[scaleResults.length - 1].score;
    const scale = scales.find(s => s.id === scaleId);
    const maxScore = scale ? scale.questions.length * Math.max(...scale.options.map(o => o.value)) : 0;

    if (last < first) return { direction: 'up', label: '改善', color: 'text-green-600' };
    if (last > first) return { direction: 'down', label: '需关注', color: 'text-amber-600' };
    return { direction: 'stable', label: '稳定', color: 'text-slate-600' };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return '今天';
    if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('zh-CN', options);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      <header className="pt-12 pb-4 px-6 bg-white z-10 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-800">{profile.name} 的评估记录</h1>
            <p className="text-sm text-slate-500">共 {results.length} 次评估</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
            {(['all', 'week', 'month', 'quarter', 'year'] as TimeFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {filter === 'all' ? '全部' :
                 filter === 'week' ? '近一周' :
                 filter === 'month' ? '近一月' :
                 filter === 'quarter' ? '近三月' : '近一年'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
            <button
              onClick={() => setSelectedScaleId('all')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                selectedScaleId === 'all'
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              全部量表
            </button>
            {scales.map(scale => (
              <button
                key={scale.id}
                onClick={() => setSelectedScaleId(scale.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedScaleId === scale.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {scale.shortName}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {timelineData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar size={48} className="text-slate-300 mb-3" />
            <p className="text-slate-500 mb-1">暂无符合条件的评估记录</p>
            <p className="text-sm text-slate-400">尝试调整筛选条件</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-300 to-indigo-100 rounded-full" />

            {timelineData.map((item, index) => (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-14 pb-8"
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 top-2 w-4 h-4 bg-white border-3 border-indigo-500 rounded-full shadow-sm z-10" />

                {/* Date Header */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{formatDate(item.date)}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.results.length} 次评估
                  </span>
                </div>

                {/* Results Cards */}
                <div className="space-y-3">
                  {item.results.map(result => {
                    const scale = scales.find(s => s.id === result.scaleId);
                    if (!scale) return null;

                    const trend = getTrend(result.scaleId);
                    const interpretation = scale.getScoreInterpretation(result.score, result.answers);

                    return (
                      <motion.button
                        key={result.id}
                        onClick={() => onViewResult(result)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full text-left bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-800 truncate">{scale.shortName}</span>
                              {trend && (
                                <span className={cn("flex items-center gap-1 text-xs", trend.color)}>
                                  {trend.direction === 'up' && <TrendingUp size={12} className="rotate-180" />}
                                  {trend.direction === 'down' && <TrendingUp size={12} />}
                                  {trend.label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock size={12} />
                              {formatTime(result.date)}
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-2xl font-bold text-indigo-600">{result.score}</div>
                            <div className={`text-xs ${interpretation.color}`}>{interpretation.level}</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>得分</span>
                            <span>{scale.questions.length * Math.max(...scale.options.map(o => o.value))} 分</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(result.score / (scale.questions.length * Math.max(...scale.options.map(o => o.value)))) * 100}%` }}
                              className={`h-full rounded-full ${interpretation.color.replace('text-', 'bg-').replace('600', '500')}`}
                            />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
