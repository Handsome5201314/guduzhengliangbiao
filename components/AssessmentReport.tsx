'use client';

import { useState, useEffect, useRef } from 'react';
import { ChildProfile, AssessmentResult } from '@/hooks/use-profiles';
import { Download, FileText, ChevronLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { toPng, toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { scales } from '@/lib/scales';

interface AssessmentReportProps {
  profile: ChildProfile;
  result: AssessmentResult;
  onClose: () => void;
}

export default function AssessmentReport({ profile, result, onClose }: AssessmentReportProps) {
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const scale = scales.find(s => s.id === result.scaleId) || scales[0];
  
  // Calculate max score considering weights if they exist
  const maxScore = scale.questions.reduce((total, q) => {
    const maxOptionValue = Math.max(...(q.reverse && scale.reverseOptions ? scale.reverseOptions : scale.options).map(o => o.value));
    if (q.weight !== undefined) {
      // If the scale uses weights (like ABC where options are 0/1), max score for this question is maxOptionValue * weight
      return total + (maxOptionValue * q.weight);
    }
    return total + maxOptionValue;
  }, 0);

  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        const systemPrompt = "你现在是一位拥有20年临床经验的发育行为儿科主治医师，并且是一位极具同理心的沟通专家。你的核心任务是根据儿童的量表得分和基本信息，为家属提供一份易于理解的评估报告和个性化建议。1. 语气要温暖、充满同理心，不带指责，阅读难度不超过小学六年级。2. 严禁使用任何专业医学词汇，严禁直接给出诊断结论（如“孤独症”、“自闭症”等字眼），用“社交沟通发展”、“互动表现”等词汇替代。3. 给出3-4条具体的、生活化的家庭互动建议，帮助家长在日常生活中引导孩子。";

        let answersText = '';
        scale.questions.forEach(q => {
          const answerValue = result.answers[q.id];
          const options = q.reverse && scale.reverseOptions ? scale.reverseOptions : scale.options;
          const answerLabel = options.find(o => o.value === answerValue)?.label || '未作答';
          answersText += `${q.id}. ${q.text}: ${answerLabel} (${answerValue}分)\n`;
        });

        const prompt = `
请为以下孩子生成一份简短的评估建议：
孩子姓名：${profile.name}
年龄：${profile.age}岁
家长补充信息：${profile.basicInfo || '无'}
量表名称：${scale.name}
量表总分：${result.score}/${maxScore}
量表背景信息：${scale.aiPromptContext}

具体表现：
${answersText}

请根据以上信息，给家长写一段温暖的反馈，并提供3-4条具体的家庭互动建议。使用 Markdown 格式排版。
`;

        const res = await fetch('/api/ai/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            systemPrompt: systemPrompt,
          }),
        });

        if (!res.ok) {
          throw new Error('AI 请求失败');
        }

        const data = await res.json();
        setAiSuggestions(data.text || '暂无建议。');
      } catch (error) {
        console.error('Failed to generate AI suggestions:', error);
        setAiSuggestions('抱歉，生成建议时出现错误，请稍后再试。');
      } finally {
        setIsGenerating(false);
      }
    };

    generateSuggestions();
  }, [profile, result, scale, maxScore]);

  const interpretation = scale.getScoreInterpretation(result.score, result.answers);

  const exportToImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(reportRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${profile.name}_评估报告_${new Date(result.date).toLocaleDateString()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export to image failed', err);
      alert('导出图片失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await toCanvas(reportRef.current, { pixelRatio: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile.name}_评估报告_${new Date(result.date).toLocaleDateString()}.pdf`);
    } catch (err) {
      console.error('Export to PDF failed', err);
      alert('导出PDF失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      <header className="pt-12 pb-6 px-6 bg-white z-10 relative border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">评估报告</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Report Content to be exported */}
        <div ref={reportRef} className="bg-white p-6 m-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{profile.name} 的{scale.shortName}报告</h2>
            <p className="text-slate-500 text-sm">
              评估日期：{new Date(result.date).toLocaleDateString()} | 年龄：{profile.age}岁
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold text-indigo-600">{result.score}</span>
              <span className="text-slate-500 mb-1">/ {maxScore} 分</span>
            </div>
            <div className={`p-4 rounded-xl border ${interpretation.color.replace('text-', 'border-').replace('600', '200')} bg-slate-50`}>
              <p className={`text-sm font-medium ${interpretation.color}`}>
                {interpretation.level}: {interpretation.description}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              各项得分明细
            </h3>
            <div className="space-y-3">
              {scale.questions.map((q) => {
                const score = result.answers[q.id];
                const options = q.reverse && scale.reverseOptions ? scale.reverseOptions : scale.options;
                const answerLabel = options.find(o => o.value === score)?.label || '未作答';
                return (
                  <div key={q.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-600 truncate max-w-[70%] pr-2" title={q.text}>{q.id}. {q.text}</span>
                    <span className="font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                      {score !== undefined ? `${answerLabel} (${score}分)` : '未作答'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <span className="text-sm font-bold">AI</span>
              </div>
              医生助手建议
            </h3>
            
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-8 text-indigo-400">
                  <Loader2 className="animate-spin mb-3" size={28} />
                  <p className="text-sm">AI 医生正在为您生成个性化建议...</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-indigo max-w-none text-slate-700 leading-relaxed">
                  <ReactMarkdown>{aiSuggestions}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Export Actions */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-slate-100 z-20 flex gap-3">
        <button
          onClick={exportToImage}
          disabled={isExporting || isGenerating}
          className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
          保存图片
        </button>
        <button
          onClick={exportToPDF}
          disabled={isExporting || isGenerating}
          className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          导出 PDF
        </button>
      </footer>
    </div>
  );
}
