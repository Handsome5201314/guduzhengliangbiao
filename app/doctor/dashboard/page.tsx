'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartPulse, 
  LogOut, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  UserRound,
  Loader2,
  AlertCircle,
  UserPlus,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';

type PatientProfile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  basicInfo: string | null;
  parent: {
    name: string | null;
    phone: string | null;
  };
  assessments?: any[];
};

type MatchRequest = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  patientProfile: PatientProfile;
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<MatchRequest[]>([]);
  const [matchedPatients, setMatchedPatients] = useState<MatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/doctor/dashboard', {
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
      setPendingRequests(data.pendingRequests || []);
      setMatchedPatients(data.matchedPatients || []);
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

  const handleMatchAction = async (matchId: string, action: 'ACCEPT' | 'REJECT') => {
    setActionLoadingId(matchId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/doctor/match/${matchId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '操作失败');
      }

      // Refresh data
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center text-emerald-600">
            <HeartPulse size={28} strokeWidth={2} />
            <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">医生工作台</span>
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
          <button 
            onClick={() => router.push('/profile/new')}
            className="bg-emerald-600 text-white rounded-2xl p-6 shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-between group text-left"
          >
            <div>
              <h3 className="text-lg font-bold mb-1">创建患儿档案</h3>
              <p className="text-emerald-100 text-sm">为患者建立新的评估档案</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
          </button>
          
          <button 
            onClick={() => router.push('/assessment/select')}
            className="bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between group text-left"
          >
            <div>
              <h3 className="text-lg font-bold mb-1 text-emerald-600">发起量表评估</h3>
              <p className="text-slate-500 text-sm">选择量表并邀请患者填写</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
          </button>
        </div>

        {/* Pending Requests Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Clock className="mr-2 text-amber-500" size={24} />
              待处理的绑定请求
              {pendingRequests.length > 0 && (
                <span className="ml-3 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </h2>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              暂无待处理的请求
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((req) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={req.id} 
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{req.patientProfile.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {req.patientProfile.gender} · {req.patientProfile.age} 岁
                      </p>
                    </div>
                    <div className="bg-amber-50 text-amber-700 text-xs font-medium px-2 py-1 rounded-md">
                      等待确认
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                      <UserRound size={16} className="mr-2 text-slate-400" />
                      家长：{req.patientProfile.parent.name || '未填写'}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock size={16} className="mr-2 text-slate-400" />
                      申请时间：{new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleMatchAction(req.id, 'ACCEPT')}
                      disabled={actionLoadingId === req.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {actionLoadingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="mr-1.5" />}
                      接受
                    </button>
                    <button
                      onClick={() => handleMatchAction(req.id, 'REJECT')}
                      disabled={actionLoadingId === req.id}
                      className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {actionLoadingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} className="mr-1.5" />}
                      拒绝
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Matched Patients Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <UserCheck className="mr-2 text-emerald-600" size={24} />
              已绑定的患者
              {matchedPatients.length > 0 && (
                <span className="ml-3 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {matchedPatients.length}
                </span>
              )}
            </h2>
          </div>

          {matchedPatients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              暂无已绑定的患者
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        患者信息
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        家长联系方式
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        最新量表状态
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {matchedPatients.map((match) => {
                      const hasAssessment = match.patientProfile.assessments && match.patientProfile.assessments.length > 0;
                      return (
                        <tr key={match.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                                {match.patientProfile.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{match.patientProfile.name}</div>
                                <div className="text-sm text-slate-500">{match.patientProfile.gender} · {match.patientProfile.age} 岁</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{match.patientProfile.parent.name || '未知'}</div>
                            <div className="text-sm text-slate-500">{match.patientProfile.parent.phone || '无手机号'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasAssessment ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                已完成评估
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                暂无数据
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => router.push(`/doctor/patient/${match.patientProfile.id}`)}
                              className="text-emerald-600 hover:text-emerald-900 flex items-center justify-end w-full"
                            >
                              <FileText size={16} className="mr-1" />
                              查看详情
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
