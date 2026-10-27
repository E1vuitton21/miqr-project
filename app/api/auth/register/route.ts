import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { registerSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Rate Limiting: 5 per 15 menit per IP
    const rateLimit = await checkRateLimit(`register:${ip}`, 5, 15 * 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Silakan coba lagi dalam ${rateLimit.resetSeconds} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Input tidak valid' },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Periksa apakah email sudah terdaftar
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        theme: 'dark',
        storageQuota: 104857600, // 100 MB
        storageUsed: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        theme: true,
        storageQuota: true,
        storageUsed: true,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      theme: user.theme,
    });

    await setSessionCookie(token);

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Register API Error]:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
