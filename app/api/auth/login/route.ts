import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword } from '@/lib/auth/password';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { loginSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate Limiting: 5 per 15 menit per IP
    const rateLimit = await checkRateLimit(`login:${ip}`, 5, 15 * 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${rateLimit.resetSeconds} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Input tidak valid' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Timing-attack prevention: jangan bocorkan apakah email ada atau salah
    if (!user) {
      return NextResponse.json({ error: 'Email atau password tidak valid' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Email atau password tidak valid' }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      theme: user.theme,
    });

    await setSessionCookie(token);

    return NextResponse.json(
      {
        message: 'Login berhasil',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          theme: user.theme,
          storageQuota: user.storageQuota,
          storageUsed: user.storageUsed,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Login API Error]:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
