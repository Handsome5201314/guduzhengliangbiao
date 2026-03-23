import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { prompt, systemPrompt } = await req.json();

    // Fetch config from DB
    const configs = await db.systemConfig.findMany({
      where: {
        keyName: {
          in: ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL']
        }
      }
    });

    const configMap = configs.reduce((acc, curr) => {
      acc[curr.keyName] = decrypt(curr.keyValue);
      return acc;
    }, {} as Record<string, string>);

    const openaiApiKey = configMap['OPENAI_API_KEY'];
    const openaiBaseUrl = configMap['OPENAI_BASE_URL'];
    const openaiModel = configMap['OPENAI_MODEL'] || 'gpt-4o';

    let responseText = '';

    if (openaiApiKey) {
      // Use OpenAI compatible endpoint
      const openai = new OpenAI({
        apiKey: openaiApiKey,
        baseURL: openaiBaseUrl || undefined,
      });

      const completion = await openai.chat.completions.create({
        model: openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      });

      responseText = completion.choices[0]?.message?.content || '抱歉，生成建议时出现错误。';
    } else {
      // Fallback to Gemini if configured via env
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiApiKey) {
        return NextResponse.json({ error: '未配置任何 AI 接口密钥' }, { status: 500 });
      }

      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const chat = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const response = await chat.sendMessage({ message: prompt });
      responseText = response.text || '抱歉，生成建议时出现错误。';
    }

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error('AI Report Error:', error);
    return NextResponse.json({ error: 'AI 服务请求失败' }, { status: 500 });
  }
}
