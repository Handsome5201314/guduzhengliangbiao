'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HeartPulse, 
  LogOut, 
  UserPlus, 
  FileText, 
  UserRound,
  Loader2,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';

type PatientProfile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  basicInfo: string | null;
  createdAt: string;
};

export default function PatientDashboard() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/patient/profile', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('获取数据失败');
      
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center text-indigo-600">
            <HeartPulse size={28} strokeWidth={2} />
            <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">家长工作台</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <LogOut size={18} className="mr-1.5" />
            退出登录
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/profile/new" className="bg-indigo-600 text-white rounded-2xl p-6 shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-between group">
            <div>
              <h3 className="text-lg font-bold mb-1">创建患儿档案</h3>
              <p className="text-indigo-100 text-sm">添加新的孩子信息以便进行评估</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
          </Link>
          
          <Link href="/assessment/select" className="bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <h3 className="text-lg font-bold mb-1 text-indigo-600">开始量表评估</h3>
              <p className="text-slate-500 text-sm">选择量表并开始 AI 辅助填写</p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
          </Link>
        </div>

        {/* Profiles List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <UserRound className="mr-2 text-slate-500" size={24} />
              我的患儿档案
              {profiles.length > 0 && (
                <span className="ml-3 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {profiles.length}
                </span>
              )}
            </h2>
          </div>

          {profiles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <UserRound size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">暂无档案</h3>
              <p className="text-slate-500 mb-6 max-w-md">
                您还没有创建任何患儿档案。请先创建档案，然后再进行量表评估。
              </p>
              <Link 
                href="/profile/new" 
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <UserPlus className="mr-2" size={18} />
                立即创建
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={profile.id} 
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {profile.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                      <p className="text-sm text-slate-500">
                        {profile.gender} · {profile.age} 岁
                      </p>
                    </div>
                  </div>
                  
                  {profile.basicInfo && (
                    <div className="text-sm text-slate-600 mb-4 line-clamp-2 bg-slate-50 p-3 rounded-lg">
                      {profile.basicInfo}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <Link
                      href={`/assessment/select?patientId=${profile.id}`}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center transition-colors"
                    >
                      <ClipboardList size={16} className="mr-1.5" />
                      去评估
                    </Link>
                    <Link
                      href={`/patient/profile/${profile.id}`}
                      className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center transition-colors"
                    >
                      <FileText size={16} className="mr-1.5" />
                      查看详情
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
