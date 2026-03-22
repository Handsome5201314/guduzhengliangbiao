'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, UserRound, ArrowRight, Loader2, HeartPulse } from 'lucide-react';
import { motion } from 'motion/react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'PATIENT' // Default to parent/patient
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '注册失败');
      }

      // Redirect based on role
      if (data.user.role === 'DOCTOR') {
        router.push('/doctor/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <HeartPulse size={48} strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          注册新账号
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          已有账号？{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            立即登录
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                请选择您的身份
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'PATIENT' })}
                  className={`relative flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    formData.role === 'PATIENT'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <UserRound size={28} className="mb-2" />
                  <span className="font-medium text-sm">我是家长</span>
                  <span className="text-xs mt-1 opacity-70">为孩子填写量表</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'DOCTOR' })}
                  className={`relative flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    formData.role === 'DOCTOR'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope size={28} className="mb-2" />
                  <span className="font-medium text-sm">我是医生</span>
                  <span className="text-xs mt-1 opacity-70">查看与分析报告</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                真实姓名
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="请输入您的真实姓名"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                手机号码
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="请输入11位手机号"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                设置密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="至少6位字符"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center items-center rounded-xl border border-transparent py-3 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  formData.role === 'DOCTOR' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    注册中...
                  </>
                ) : (
                  <>
                    完成注册
                    <ArrowRight className="ml-2" size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
