import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { phone, password, name, role } = await req.json();

    if (!phone || !password || !name || !role) {
      return NextResponse.json({ error: '请填写所有必填项' }, { status: 400 });
    }

    if (role !== 'PATIENT' && role !== 'DOCTOR') {
      return NextResponse.json({ error: '无效的角色类型' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: '该手机号已被注册' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { 
        phone, 
        passwordHash, 
        name, 
        role 
      }
    });

    const session = await encrypt({ id: user.id, role: user.role, name: user.name });
    const cookieStore = await cookies();
    cookieStore.set('session', session, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none', 
      path: '/' 
    });

    return NextResponse.json({ 
      success: true, 
      token: session,
      user: { id: user.id, role: user.role, name: user.name } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: '服务器内部错误，请稍后重试' }, { status: 500 });
  }
}
