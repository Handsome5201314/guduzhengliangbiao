import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { action } = await req.json(); // 'ACCEPT' or 'REJECT'
    const { id: matchId } = await params;

    if (action !== 'ACCEPT' && action !== 'REJECT') {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

    const match = await db.doctorPatientMatch.findUnique({
      where: { id: matchId }
    });

    if (!match || match.doctorId !== session.id) {
      return NextResponse.json({ error: '找不到该绑定请求' }, { status: 404 });
    }

    if (match.status !== 'PENDING_DOCTOR') {
      return NextResponse.json({ error: '该请求已处理或状态无效' }, { status: 400 });
    }

    const newStatus = action === 'ACCEPT' ? 'MATCHED' : 'REJECTED';

    const updatedMatch = await db.doctorPatientMatch.update({
      where: { id: matchId },
      data: { status: newStatus }
    });

    return NextResponse.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error('Error updating match status:', error);
    return NextResponse.json({ error: '处理请求失败，请稍后重试' }, { status: 500 });
  }
}
