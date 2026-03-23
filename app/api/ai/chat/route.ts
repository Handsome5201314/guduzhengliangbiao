import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, contextMessage } = await req.json();

    // Fetch config from DB
    const configs = await db.systemConfig.findMany({
      where: {
        keyName: {
          in: ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL', 'SILICONFLOW_API_KEY', 'SOPHGO_API_KEY']
        }
      }
    });

    const configMap = configs.reduce((acc, curr) => {
      acc[curr.keyName] = decrypt(curr.keyValue);
      return acc;
    }, {} as Record<string, string>);

    let openaiApiKey = configMap['OPENAI_API_KEY'];
    let openaiBaseUrl = configMap['OPENAI_BASE_URL'];
    let openaiModel = configMap['OPENAI_MODEL'] || 'gpt-4o';

    if (!openaiApiKey && configMap['SILICONFLOW_API_KEY']) {
      openaiApiKey = configMap['SILICONFLOW_API_KEY'];
      openaiBaseUrl = 'https://api.siliconflow.cn/v1';
      openaiModel = 'deepseek-ai/DeepSeek-V3'; // Default model for SiliconFlow
    } else if (!openaiApiKey && configMap['SOPHGO_API_KEY']) {
      openaiApiKey = configMap['SOPHGO_API_KEY'];
      // Add sophgo base url and model if known, otherwise it might fail
    }

    let responseText = '';

    if (openaiApiKey) {
      // Use OpenAI compatible endpoint
      const openai = new OpenAI({
        apiKey: openaiApiKey,
        baseURL: openaiBaseUrl || undefined,
      });

      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.content })),
        { role: 'user', content: contextMessage }
      ];

      const completion = await openai.chat.completions.create({
        model: openaiModel,
        messages: formattedMessages as any,
      });

      responseText = completion.choices[0]?.message?.content || '抱歉，我暂时无法回答。';
    } else {
      // Fallback to Gemini if configured via env
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiApiKey) {
        return NextResponse.json({ error: '未配置任何 AI 接口密钥' }, { status: 500 });
      }

      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      
      const contents = [
        ...messages.map((m: any) => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: contextMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: contents as any,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      responseText = response.text || '抱歉，我暂时无法回答。';
    }

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'AI 服务请求失败' }, { status: 500 });
  }
}
