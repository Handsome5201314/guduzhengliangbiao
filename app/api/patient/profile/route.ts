import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { name, age, gender, basicInfo } = await req.json();

    if (!name || age === undefined || !gender) {
      return NextResponse.json({ error: '请填写完整必填信息' }, { status: 400 });
    }

    const profile = await db.patientProfile.create({
      data: {
        parentId: session.id, // Can be PATIENT or DOCTOR
        name,
        age,
        gender,
        basicInfo
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error creating patient profile:', error);
    return NextResponse.json({ error: '创建档案失败，请稍后重试' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    let profiles = [];

    if (session.role === 'DOCTOR') {
      // For doctors, get profiles they created AND profiles matched with them
      const createdProfiles = await db.patientProfile.findMany({
        where: { parentId: session.id },
        orderBy: { createdAt: 'desc' }
      });

      const matchedProfiles = await db.doctorPatientMatch.findMany({
        where: { doctorId: session.id, status: 'MATCHED' },
        include: { patientProfile: true }
      });

      // Combine and deduplicate
      const allProfilesMap = new Map();
      createdProfiles.forEach(p => allProfilesMap.set(p.id, p));
      matchedProfiles.forEach(m => allProfilesMap.set(m.patientProfile.id, m.patientProfile));
      
      profiles = Array.from(allProfilesMap.values());
    } else {
      // For patients, get profiles they created
      profiles = await db.patientProfile.findMany({
        where: { parentId: session.id },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Error fetching patient profiles:', error);
    return NextResponse.json({ error: '获取档案失败，请稍后重试' }, { status: 500 });
  }
}
