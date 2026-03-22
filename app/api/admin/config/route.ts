import { encrypt } from '@/lib/crypto';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const configs = await db.systemConfig.findMany({
      where: {
        keyName: {
          in: ['SOPHGO_API_KEY', 'SILICONFLOW_API_KEY']
        }
      }
    });

    const configStatus = {
      SOPHGO: configs.some(c => c.keyName === 'SOPHGO_API_KEY'),
      SILICONFLOW: configs.some(c => c.keyName === 'SILICONFLOW_API_KEY'),
    };

    return NextResponse.json({ configs: configStatus });
  } catch (error) {
    console.error('Error fetching admin configs:', error);
    return NextResponse.json({ error: '获取配置失败' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { provider, apiKey } = await req.json();
    
    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Missing provider or apiKey' }, { status: 400 });
    }

    const keyName = `${provider}_API_KEY`;
    const encryptedValue = encrypt(apiKey);
    
    await db.systemConfig.upsert({
      where: { keyName },
      update: { keyValue: encryptedValue },
      create: { keyName, keyValue: encryptedValue, description: `${provider} API 密钥` }
    });

    return NextResponse.json({ success: true, message: 'API Key 已加密保存' });
  } catch (error) {
    console.error('Failed to save API Key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
