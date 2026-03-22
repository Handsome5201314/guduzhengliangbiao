import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const doctorId = session.id;

    // Fetch pending requests (waiting for doctor to approve)
    const pendingRequests = await db.doctorPatientMatch.findMany({
      where: {
        doctorId,
        status: 'PENDING_DOCTOR',
      },
      include: {
        patientProfile: {
          include: {
            parent: {
              select: { name: true, phone: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch matched patients
    const matchedPatients = await db.doctorPatientMatch.findMany({
      where: {
        doctorId,
        status: 'MATCHED',
      },
      include: {
        patientProfile: {
          include: {
            parent: {
              select: { name: true, phone: true }
            },
            assessments: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      pendingRequests,
      matchedPatients
    });
  } catch (error) {
    console.error('Error fetching doctor dashboard data:', error);
    return NextResponse.json({ error: '获取数据失败，请稍后重试' }, { status: 500 });
  }
}
