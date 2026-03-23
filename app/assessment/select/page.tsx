'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ClipboardList, 
  ArrowLeft, 
  Loader2, 
  ChevronRight,
  BrainCircuit,
  Baby,
  Activity,
  HeartPulse
} from 'lucide-react';
import { motion } from 'motion/react';
import { scales } from '@/lib/scales';

const UI_CONFIG: Record<string, any> = {
  'simple-social': {
    ageRange: '16-30个月',
    icon: Baby,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
  },
  'srs': {
    ageRange: '4-18岁',
    icon: HeartPulse,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
  },
  'snap-iv-26': {
    ageRange: '6-18岁',
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
  },
  'abc': {
    ageRange: '18个月-14岁',
    icon: ClipboardList,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
  },
  'cars': {
    ageRange: '2岁以上',
    icon: BrainCircuit,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
  }
};

function AssessmentSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/patient/profile', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
          if (!selectedPatientId && data.profiles?.length > 0) {
            setSelectedPatientId(data.profiles[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profiles', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [selectedPatientId]);

  const handleSelectScale = (scaleId: string) => {
    if (!selectedPatientId) {
      alert('请先选择或创建患儿档案');
      return;
    }
    router.push(`/assessment/${scaleId}?patientId=${selectedPatientId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          返回工作台
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center mb-4">
            <ClipboardList className="mr-3 text-indigo-600" size={32} />
            选择评估量表
          </h1>
          <p className="text-slate-600 text-lg">
            请选择适合患儿年龄和评估需求的量表。填写过程中将有 AI 助手全程辅助。
          </p>
        </div>

        {/* Patient Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            当前评估对象
          </label>
          {profiles.length === 0 ? (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4">
              <span className="text-amber-700 font-medium">您还没有创建患儿档案</span>
              <Link 
                href="/profile/new" 
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-white px-4 py-2 rounded-lg border border-indigo-200"
              >
                去创建
              </Link>
            </div>
          ) : (
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-base bg-slate-50"
            >
              <option value="" disabled>请选择患儿</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.gender}, {p.age}岁)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Scales Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scales.map((scale, index) => {
            const config = UI_CONFIG[scale.id] || UI_CONFIG['abc'];
            const Icon = config.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={scale.id}
                onClick={() => handleSelectScale(scale.id)}
                className={`bg-white rounded-2xl p-6 shadow-sm border ${config.borderColor} ${config.hoverBorder} cursor-pointer transition-all hover:shadow-md group flex flex-col h-full relative overflow-hidden`}
              >
                <div className={`w-14 h-14 rounded-2xl ${config.bgColor} ${config.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{scale.shortName}</h3>
                <h4 className="text-sm font-medium text-slate-500 mb-4">{scale.name}</h4>
                
                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 mb-4 w-fit">
                  适用年龄: {config.ageRange}
                </div>
                
                <p className="text-slate-600 text-sm flex-grow mb-6">
                  {scale.description}
                </p>
                
                <div className={`mt-auto flex items-center font-bold text-sm ${config.color}`}>
                  开始评估
                  <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}>
      <AssessmentSelectContent />
    </Suspense>
  );
}
