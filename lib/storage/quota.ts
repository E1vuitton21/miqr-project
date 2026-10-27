import { prisma } from '@/lib/db';

export interface UserQuotaSummary {
  quotaBytes: number;
  usedBytes: number;
  availableBytes: number;
  percentUsed: number;
}

/**
 * Pemotongan kuota secara atomik langsung di PostgreSQL.
 * Mengeliminasi Race Condition / TOCTOU exploit.
 * Mengembalikan true jika berhasil dipotong, false jika kuota tidak mencukupi.
 */
export async function atomicDeductQuota(userId: string, additionalBytes: number): Promise<boolean> {
  if (additionalBytes <= 0) return true;

  const rowsUpdated = await prisma.$executeRaw`
    UPDATE "User"
    SET "storageUsed" = "storageUsed" + ${additionalBytes},
        "updatedAt" = NOW()
    WHERE "id" = ${userId}
      AND ("storageUsed" + ${additionalBytes}) <= "storageQuota"
  `;

  return rowsUpdated === 1;
}

/**
 * Mengembalikan kuota saat file dihapus
 */
export async function atomicRestoreQuota(userId: string, bytesToRestore: number): Promise<void> {
  if (bytesToRestore <= 0) return;

  await prisma.$executeRaw`
    UPDATE "User"
    SET "storageUsed" = GREATEST(0, "storageUsed" - ${bytesToRestore}),
        "updatedAt" = NOW()
    WHERE "id" = ${userId}
  `;
}

/**
 * Mengambil ringkasan kuota pengguna
 */
export async function getUserQuota(userId: string): Promise<UserQuotaSummary | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageQuota: true, storageUsed: true },
  });

  if (!user) return null;

  const quotaBytes = user.storageQuota;
  const usedBytes = user.storageUsed;
  const availableBytes = Math.max(0, quotaBytes - usedBytes);
  const percentUsed = quotaBytes > 0 ? Math.min(100, Math.round((usedBytes / quotaBytes) * 100)) : 100;

  return {
    quotaBytes,
    usedBytes,
    availableBytes,
    percentUsed,
  };
}
