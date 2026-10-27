import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { qrConfigSchema } from '@/lib/validation/schemas';
import { generateServerQrBuffer } from '@/lib/qr/generator';
import { sanitizeAndResizeLogo } from '@/lib/image/processor';
import { atomicDeductQuota, atomicRestoreQuota } from '@/lib/storage/quota';
import { saveUserFile, deleteUserFile } from '@/lib/storage/filesystem';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const contentType = searchParams.get('contentType') || undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;

  const whereClause: any = {
    userId: session.userId,
    status: 'ACTIVE',
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { payload: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (contentType) {
    whereClause.contentType = contentType;
  }

  const [total, items] = await Promise.all([
    prisma.qrCode.count({ where: whereClause }),
    prisma.qrCode.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        contentType: true,
        payload: true,
        errorCorrection: true,
        foreground: true,
        background: true,
        width: true,
        margin: true,
        dotsStyle: true,
        fileFormat: true,
        fileSize: true,
        logoSize: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate Limiting: max 30 QR generate/save per menit per user
  const rateLimit = await checkRateLimit(`qr_create:${session.userId}`, 30, 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan pembuatan QR. Mohon tunggu beberapa saat.' },
      { status: 429 }
    );
  }

  try {
    const contentTypeHeader = req.headers.get('content-type') || '';
    let parsedData: any;
    let logoBuffer: Buffer | undefined;

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await req.formData();
      const rawConfig = {
        name: formData.get('name') as string,
        contentType: formData.get('contentType') as string,
        payload: formData.get('payload') as string,
        errorCorrection: (formData.get('errorCorrection') as string) || 'M',
        foreground: (formData.get('foreground') as string) || '#000000',
        background: (formData.get('background') as string) || '#FFFFFF',
        width: formData.get('width') || 1024,
        margin: formData.get('margin') || 4,
        dotsStyle: (formData.get('dotsStyle') as string) || 'SQUARE',
        fileFormat: (formData.get('fileFormat') as string) || 'PNG',
      };

      const validated = qrConfigSchema.safeParse(rawConfig);
      if (!validated.success) {
        return NextResponse.json(
          { error: validated.error.errors[0]?.message || 'Konfigurasi tidak valid' },
          { status: 400 }
        );
      }
      parsedData = validated.data;

      const logoFile = formData.get('logo') as File | null;
      if (logoFile && logoFile.size > 0) {
        if (logoFile.size > 2 * 1024 * 1024) {
          return NextResponse.json({ error: 'Ukuran file logo maksimal 2 MB' }, { status: 400 });
        }
        const arrayBuf = await logoFile.arrayBuffer();
        const rawBuf = Buffer.from(arrayBuf);
        try {
          const sanitized = await sanitizeAndResizeLogo(rawBuf);
          logoBuffer = sanitized.buffer;
        } catch (imgErr: any) {
          return NextResponse.json({ error: imgErr.message || 'File logo tidak valid' }, { status: 400 });
        }
      }
    } else {
      const jsonBody = await req.json();
      const validated = qrConfigSchema.safeParse(jsonBody);
      if (!validated.success) {
        return NextResponse.json(
          { error: validated.error.errors[0]?.message || 'Konfigurasi tidak valid' },
          { status: 400 }
        );
      }
      parsedData = validated.data;
    }

    // 1. Generate Master QR Buffer
    const generated = await generateServerQrBuffer({
      payload: parsedData.payload,
      errorCorrection: parsedData.errorCorrection,
      foreground: parsedData.foreground,
      background: parsedData.background,
      width: parsedData.width,
      margin: parsedData.margin,
      fileFormat: parsedData.fileFormat,
      logoBuffer,
    });

    const qrFileSize = generated.sizeBytes;
    const logoFileSize = logoBuffer ? logoBuffer.length : 0;
    const totalBytesRequired = qrFileSize + logoFileSize;

    // 2. ATOMIC QUOTA DEDUCTION di PostgreSQL
    const quotaGranted = await atomicDeductQuota(session.userId, totalBytesRequired);
    if (!quotaGranted) {
      return NextResponse.json(
        { error: 'Kuota penyimpanan cloud Anda tidak mencukupi (Maksimal 100 MB).' },
        { status: 413 }
      );
    }

    // 3. Simpan file fisik ke volume storage privat (Pola Kompensasi jika gagal)
    const fileExt = parsedData.fileFormat === 'SVG' ? 'svg' : 'png';
    const timestamp = Date.now();
    const qrFileName = `qr_${timestamp}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    let savedQrFile: { relativePath: string };
    let savedLogoFile: { relativePath: string } | undefined;

    try {
      savedQrFile = await saveUserFile(session.userId, qrFileName, generated.buffer);
      if (logoBuffer) {
        const logoFileName = `logo_${timestamp}_${Math.random().toString(36).substring(2, 8)}.png`;
        savedLogoFile = await saveUserFile(session.userId, logoFileName, logoBuffer);
      }
    } catch (fsErr) {
      // Rollback kuota jika gagal tulis ke disk
      await atomicRestoreQuota(session.userId, totalBytesRequired);
      console.error('[Storage Error]:', fsErr);
      return NextResponse.json({ error: 'Gagal menyimpan file ke penyimpanan server' }, { status: 500 });
    }

    // 4. Catat Metadata ke Database
    try {
      const qrRecord = await prisma.qrCode.create({
        data: {
          userId: session.userId,
          name: parsedData.name,
          contentType: parsedData.contentType,
          payload: parsedData.payload,
          errorCorrection: parsedData.errorCorrection,
          foreground: parsedData.foreground,
          background: parsedData.background,
          width: parsedData.width,
          margin: parsedData.margin,
          dotsStyle: parsedData.dotsStyle,
          fileFormat: parsedData.fileFormat,
          filePath: savedQrFile.relativePath,
          fileSize: qrFileSize,
          logoPath: savedLogoFile?.relativePath || null,
          logoSize: logoFileSize,
          status: 'ACTIVE',
        },
      });

      return NextResponse.json(
        {
          message: 'QR Code berhasil dibuat dan disimpan ke cloud MiQR',
          qr: qrRecord,
        },
        { status: 201 }
      );
    } catch (dbErr) {
      // Rollback file dan kuota jika gagal insert DB
      await deleteUserFile(session.userId, savedQrFile.relativePath);
      if (savedLogoFile) {
        await deleteUserFile(session.userId, savedLogoFile.relativePath);
      }
      await atomicRestoreQuota(session.userId, totalBytesRequired);
      console.error('[DB Insert Error]:', dbErr);
      return NextResponse.json({ error: 'Gagal mencatat data ke database' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Create QR Error]:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
