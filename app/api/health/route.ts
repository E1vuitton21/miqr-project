import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbHealthy = false;
  let redisHealthy = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch (e) {
    console.error('[Health] DB error:', e);
  }

  try {
    if (redis && redis.status === 'ready') {
      const pong = await redis.ping();
      redisHealthy = pong === 'PONG';
    }
  } catch (e) {
    console.error('[Health] Redis error:', e);
  }

  const isHealthy = dbHealthy; // DB is critical

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealthy,
      redis: redisHealthy,
      version: '1.0.0',
    },
    { status: isHealthy ? 200 : 503 }
  );
}
