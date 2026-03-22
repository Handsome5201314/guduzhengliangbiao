'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Key, Save, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

type ConfigStatus = {
  SOPHGO: boolean;
  SILICONFLOW: boolean;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    SOPHGO: false,
    SILICONFLOW: false,
  });

  const [keys, setKeys] = useState({
    SOPHGO: '',
    SILICONFLOW: '',
  });

  useEffect(() => {
    fetchConfigs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('获取配置失败');
      
      const data = await res.json();
      setConfigStatus(data.configs || { SOPHGO: false, SILICONFLOW: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleSaveKey = async (provider: 'SOPHGO' | 'SILICONFLOW') => {
    const apiKey = keys[provider];
    if (!apiKey.trim()) {
      setError(`请输入 ${provider} 的 API Key`);
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '保存失败');
      }

      setSuccessMsg(`${provider} API Key 已成功保存并加密`);
      setKeys(prev => ({ ...prev, [provider]: '' })); // Clear input
      await fetchConfigs(); // Refresh status
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
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
            <ShieldCheck size={28} strokeWidth={2} />
            <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">系统管理后台</span>
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API 密钥配置</h1>
          <p className="text-slate-500 mt-2">
            在此配置系统所需的大模型 API 密钥。密钥将被安全加密存储，前端无法读取。
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center">
            <CheckCircle size={20} className="mr-2 flex-shrink-0" />
            {successMsg}
          </motion.div>
        )}

        <div className="space-y-6">
          {/* SOPHGO Config Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Key size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-slate-900">算能 (SOPHGO)</h3>
                  <p className="text-sm text-slate-500">用于驱动系统的核心 AI 助手</p>
                </div>
              </div>
              {configStatus.SOPHGO ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle size={14} className="mr-1" /> 已配置
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  未配置
                </span>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <input
                type="password"
                placeholder="输入 SOPHGO_API_KEY"
                value={keys.SOPHGO}
                onChange={(e) => setKeys({ ...keys, SOPHGO: e.target.value })}
                className="flex-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
              <button
                onClick={() => handleSaveKey('SOPHGO')}
                disabled={isSaving || !keys.SOPHGO.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="mr-2" />}
                保存
              </button>
            </div>
          </div>

          {/* SILICONFLOW Config Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Key size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-slate-900">硅基流动 (SiliconFlow)</h3>
                  <p className="text-sm text-slate-500">备用大模型接口配置</p>
                </div>
              </div>
              {configStatus.SILICONFLOW ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle size={14} className="mr-1" /> 已配置
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  未配置
                </span>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <input
                type="password"
                placeholder="输入 SILICONFLOW_API_KEY"
                value={keys.SILICONFLOW}
                onChange={(e) => setKeys({ ...keys, SILICONFLOW: e.target.value })}
                className="flex-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
              <button
                onClick={() => handleSaveKey('SILICONFLOW')}
                disabled={isSaving || !keys.SILICONFLOW.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="mr-2" />}
                保存
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
