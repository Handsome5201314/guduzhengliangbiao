import Link from 'next/link';
import { HeartPulse, ArrowRight, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center text-indigo-600">
          <HeartPulse size={28} strokeWidth={2} />
          <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">星语守护</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            登录
          </Link>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            免费注册
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 ring-1 ring-inset ring-indigo-600/20 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
          全新升级：AI 辅助评估系统
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-3xl">
          孤独症儿童量表 <br className="hidden sm:block" />
          <span className="text-indigo-600">动态辅助填写系统</span>
        </h1>
        
        <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mb-10">
          连接家长与专业医生，内置 AI 医生助手实时解答疑惑，让每一次评估都更准确、更安心。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <Link 
            href="/register" 
            className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          >
            <UserRound className="mr-2" size={20} />
            家长端入口
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          >
            <Stethoscope className="mr-2" size={20} />
            医生端入口
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl w-full text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">医患双向匹配</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              严格的隐私保护机制，只有双方确认同意后，医生才能查看患者的评估报告，确保数据绝对安全。
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <Stethoscope size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">多角色协同</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              支持家长管理多个孩子档案，医生拥有独立工作台管理多科室患者，管理员全局统筹。
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
              <HeartPulse size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI 智能辅助</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              填写量表遇到困惑？AI 助手用通俗易懂的语言为您解答，不涉及专业词汇，如同真实医生在旁指导。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
