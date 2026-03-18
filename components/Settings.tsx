'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Eye, EyeOff, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  models: string[];
  apiKey: string;
  selectedModel: string;
  isDefault?: boolean;
}

interface SettingsProps {
  onBack: () => void;
}

const DEFAULT_PROVIDERS: Omit<AIProvider, 'apiKey' | 'selectedModel'>[] = [
  {
    id: 'siliconflow',
    name: 'siliconflow',
    displayName: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: [
      'deepseek-ai/DeepSeek-V3',
      'deepseek-ai/DeepSeek-R1',
      'Qwen/Qwen2.5-72B-Instruct',
      'meta-llama/Meta-Llama-3.1-70B-Instruct',
      '01-ai/Yi-1.5-34B-Chat'
    ],
    isDefault: true
  },
  {
    id: 'cambricon',
    name: 'cambricon',
    displayName: '算能平台',
    baseUrl: 'https://api.cambricon.com/v1',
    models: [
      'chatglm3-6b',
      'glm-4',
      'glm-4v'
    ],
    isDefault: false
  },
  {
    id: 'openai-compatible',
    name: 'openai-compatible',
    displayName: '自定义 OpenAI 兼容',
    baseUrl: '',
    models: [],
    isDefault: false
  }
];

export default function Settings({ onBack }: SettingsProps) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<string>('');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customProvider, setCustomProvider] = useState<Partial<AIProvider>>({});

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ai_providers');
      if (stored) {
        try {
          const loadedProviders = JSON.parse(stored);
          setProviders(loadedProviders);
          const activeId = localStorage.getItem('active_provider_id');
          if (activeId) {
            setActiveProviderId(activeId);
          }
        } catch (e) {
          console.error('Failed to load providers:', e);
        }
      }
    }
  };

  const saveProviders = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('ai_providers', JSON.stringify(providers));
      localStorage.setItem('active_provider_id', activeProviderId);
      setSaveMessage({ type: 'success', text: '配置保存成功' });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: '保存失败,请重试' });
      console.error('Failed to save providers:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApiKeyChange = (providerId: string, apiKey: string) => {
    setProviders(providers.map(p =>
      p.id === providerId ? { ...p, apiKey } : p
    ));
  };

  const handleModelChange = (providerId: string, model: string) => {
    setProviders(providers.map(p =>
      p.id === providerId ? { ...p, selectedModel: model } : p
    ));
  };

  const handleBaseUrlChange = (providerId: string, baseUrl: string) => {
    setProviders(providers.map(p =>
      p.id === providerId ? { ...p, baseUrl } : p
    ));
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const addCustomProvider = () => {
    if (!customProvider.name || !customProvider.displayName || !customProvider.baseUrl) {
      setSaveMessage({ type: 'error', text: '请填写完整信息' });
      return;
    }

    const newProvider: AIProvider = {
      id: `custom-${Date.now()}`,
      name: customProvider.name!,
      displayName: customProvider.displayName!,
      baseUrl: customProvider.baseUrl!,
      models: customProvider.models || [],
      apiKey: '',
      selectedModel: ''
    };

    setProviders([...providers, newProvider]);
    setCustomProvider({});
    setSaveMessage({ type: 'success', text: '自定义平台添加成功' });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const deleteProvider = (providerId: string) => {
    if (window.confirm('确定要删除此配置吗?')) {
      const newProviders = providers.filter(p => p.id !== providerId);
      setProviders(newProviders);
      if (activeProviderId === providerId) {
        setActiveProviderId(newProviders.length > 0 ? newProviders[0].id : '');
      }
    }
  };

  const getAvailableModels = (provider: AIProvider) => {
    if (provider.models.length > 0) {
      return provider.models;
    }
    // 自定义平台的常见模型
    return [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo-preview',
      'claude-3-haiku',
      'claude-3-sonnet',
      'claude-3-opus'
    ];
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      <header className="pt-12 pb-6 px-6 bg-white z-10 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-800">AI 设置</h1>
            <p className="text-sm text-slate-500">配置 AI 助手使用的模型</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Save Message */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2",
                saveMessage.type === 'success'
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              )}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="font-medium">{saveMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Provider Selection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-4">当前使用的平台</h2>
          <div className="space-y-2">
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => setActiveProviderId(provider.id)}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all flex items-center justify-between",
                  activeProviderId === provider.id
                    ? "bg-indigo-50 border-2 border-indigo-500"
                    : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                )}
              >
                <div>
                  <div className="font-medium text-slate-800">{provider.displayName}</div>
                  {provider.apiKey && (
                    <div className="text-xs text-slate-500 mt-1">
                      已配置: {provider.selectedModel || '未选择模型'}
                    </div>
                  )}
                  {!provider.apiKey && (
                    <div className="text-xs text-amber-600 mt-1">未配置 API Key</div>
                  )}
                </div>
                {activeProviderId === provider.id && (
                  <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Configurations */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800">平台配置</h2>
          {providers.map(provider => (
            <motion.div
              key={provider.id}
              className={cn(
                "bg-white p-5 rounded-2xl border transition-all",
                activeProviderId === provider.id ? "border-indigo-300 shadow-md" : "border-slate-200"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{provider.displayName}</h3>
                  <p className="text-sm text-slate-500 mt-1">{provider.name}</p>
                </div>
                {!provider.isDefault && (
                  <button
                    onClick={() => deleteProvider(provider.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* API Key Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKeys[provider.id] ? 'text' : 'password'}
                      value={provider.apiKey}
                      onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                      placeholder="请输入 API Key"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility(provider.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showApiKeys[provider.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Base URL - Only for custom providers */}
                {provider.id.startsWith('custom-') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Base URL</label>
                    <input
                      type="text"
                      value={provider.baseUrl}
                      onChange={(e) => handleBaseUrlChange(provider.id, e.target.value)}
                      placeholder="https://api.example.com/v1"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                    />
                  </div>
                )}

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">模型</label>
                  <select
                    value={provider.selectedModel}
                    onChange={(e) => handleModelChange(provider.id, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">选择模型</option>
                    {getAvailableModels(provider).map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Custom Provider */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-indigo-600" />
            添加自定义平台
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={customProvider.displayName || ''}
              onChange={(e) => setCustomProvider({ ...customProvider, displayName: e.target.value })}
              placeholder="平台显示名称"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
            />
            <input
              type="text"
              value={customProvider.name || ''}
              onChange={(e) => setCustomProvider({ ...customProvider, name: e.target.value })}
              placeholder="平台标识 (英文)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
            />
            <input
              type="text"
              value={customProvider.baseUrl || ''}
              onChange={(e) => setCustomProvider({ ...customProvider, baseUrl: e.target.value })}
              placeholder="Base URL (如 https://api.example.com/v1)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
            />
            <button
              onClick={addCustomProvider}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              添加平台
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 bg-white border-t border-slate-100">
        <button
          onClick={saveProviders}
          disabled={isSaving}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? '保存中...' : '保存配置'}
        </button>
      </footer>
    </div>
  );
}
