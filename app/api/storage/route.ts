import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserQuota } from '@/lib/storage/quota';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const quota = await getUserQuota(session.userId);
  if (!quota) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(quota);
}
