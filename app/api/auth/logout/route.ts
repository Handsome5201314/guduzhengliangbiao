import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '退出登录失败' }, { status: 500 });
  }
}
