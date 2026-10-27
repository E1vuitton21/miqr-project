import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { atomicRestoreQuota } from '@/lib/storage/quota';
import { deleteUserFile } from '@/lib/storage/filesystem';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // OWASP A01: Anti-IDOR (selalu filter userId = session.userId)
  const qr = await prisma.qrCode.findFirst({
    where: {
      id,
      userId: session.userId,
      status: 'ACTIVE',
    },
  });

  if (!qr) {
    return NextResponse.json({ error: 'QR Code tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(qr);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name || name.length > 100) {
    return NextResponse.json({ error: 'Nama QR Code minimal 1 dan maksimal 100 karakter' }, { status: 400 });
  }

  const existing = await prisma.qrCode.findFirst({
    where: { id, userId: session.userId, status: 'ACTIVE' },
  });

  if (!existing) {
    return NextResponse.json({ error: 'QR Code tidak ditemukan' }, { status: 404 });
  }

  const updated = await prisma.qrCode.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json({ message: 'Metadata berhasil diperbarui', qr: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.qrCode.findFirst({
    where: { id, userId: session.userId, status: 'ACTIVE' },
  });

  if (!existing) {
    return NextResponse.json({ error: 'QR Code tidak ditemukan' }, { status: 404 });
  }

  // 1. Soft Delete pada Database
  await prisma.qrCode.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
      deletedAt: new Date(),
    },
  });

  // 2. Kembalikan kuota yang terpakai ke user secara atomik
  const totalBytesToFree = existing.fileSize + existing.logoSize;
  await atomicRestoreQuota(session.userId, totalBytesToFree);

  // 3. Hapus file fisik dari volume storage
  if (existing.filePath) {
    await deleteUserFile(session.userId, existing.filePath);
  }
  if (existing.logoPath) {
    await deleteUserFile(session.userId, existing.logoPath);
  }

  return NextResponse.json({ message: 'QR Code berhasil dihapus dan kuota dipulihkan' });
}
