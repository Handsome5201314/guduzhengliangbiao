import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: '请填写手机号和密码' }, { status: 400 });
    }

    // --- ADMIN BACKDOOR FOR PROTOTYPE ---
    if (phone === 'admin' && password === 'admin123') {
      let adminUser = await db.user.findUnique({ where: { phone: 'admin' } });
      if (!adminUser) {
        const passwordHash = await bcrypt.hash('admin123', 10);
        adminUser = await db.user.create({
          data: {
            phone: 'admin',
            name: '系统管理员',
            role: 'ADMIN',
            passwordHash
          }
        });
      }
      const session = await encrypt({ id: adminUser.id, role: adminUser.role, name: adminUser.name });
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
        user: { id: adminUser.id, role: adminUser.role, name: adminUser.name } 
      });
    }
    // ------------------------------------

    const user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ error: '手机号或密码错误' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: '手机号或密码错误' }, { status: 401 });
    }

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
    console.error('Login error:', error);
    return NextResponse.json({ error: '服务器内部错误，请稍后重试' }, { status: 500 });
  }
}
