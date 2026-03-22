import { db } from '@/lib/db';

export async function handleMatchAction(
  matchId: string, 
  action: 'ACCEPT' | 'REJECT', 
  currentUser: { id: string, role: string }
) {
  const match = await db.doctorPatientMatch.findUnique({ 
    where: { id: matchId },
    include: { patientProfile: true }
  });
  
  if (!match) throw new Error("匹配记录不存在");

  let newStatus = match.status;

  if (action === 'REJECT') {
    newStatus = 'REJECTED';
  } else if (action === 'ACCEPT') {
    if (match.status === 'PENDING_DOCTOR' && currentUser.role === 'DOCTOR') {
      if (currentUser.id !== match.doctorId) throw new Error("无权操作");
      newStatus = 'MATCHED';
    } else if (match.status === 'PENDING_PATIENT' && currentUser.role === 'PATIENT') {
      if (currentUser.id !== match.patientProfile.parentId) throw new Error("无权操作");
      newStatus = 'MATCHED';
    } else {
      throw new Error("当前状态无法执行同意操作，或角色不匹配");
    }
  }

  return await db.doctorPatientMatch.update({
    where: { id: matchId },
    data: { status: newStatus }
  });
}

export async function getMatchedPatientsForDoctor(doctorId: string) {
  return await db.doctorPatientMatch.findMany({
    where: { 
      doctorId: doctorId,
      status: 'MATCHED'
    },
    include: {
      patientProfile: {
        include: { assessments: true }
      }
    }
  });
}
