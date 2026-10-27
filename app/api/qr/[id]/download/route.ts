import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { readUserFile } from '@/lib/storage/filesystem';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // OWASP A01: Pastikan user hanya bisa mendownload file miliknya sendiri
  const qr = await prisma.qrCode.findFirst({
    where: {
      id,
      userId: session.userId,
      status: 'ACTIVE',
    },
  });

  if (!qr || !qr.filePath) {
    return NextResponse.json({ error: 'File QR Code tidak ditemukan' }, { status: 404 });
  }

  const fileBuffer = await readUserFile(session.userId, qr.filePath);
  if (!fileBuffer) {
    return NextResponse.json({ error: 'Aset file fisik tidak ditemukan di server' }, { status: 404 });
  }

  const isSvg = qr.fileFormat === 'SVG';
  const mimeType = isSvg ? 'image/svg+xml' : 'image/png';
  const ext = isSvg ? 'svg' : 'png';
  const safeName = qr.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'qrcode';
  const fileName = `${safeName}.${ext}`;

  return new NextResponse(fileBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    },
  });
}
