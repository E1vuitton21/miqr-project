import fs from 'fs/promises';
import path from 'path';

function getStorageRoot(): string {
  if (process.env.STORAGE_ROOT) {
    return path.resolve(process.env.STORAGE_ROOT);
  }
  return path.join(process.cwd(), 'storage_data');
}

export async function ensureStorageDirectories(userId: string): Promise<string> {
  const root = getStorageRoot();
  const userDir = path.join(root, 'users', userId);
  await fs.mkdir(userDir, { recursive: true });
  return userDir;
}

export async function saveUserFile(
  userId: string,
  fileName: string,
  buffer: Buffer
): Promise<{ relativePath: string; absolutePath: string }> {
  const sanitizedFileName = path.basename(fileName);
  const userDir = await ensureStorageDirectories(userId);
  const absolutePath = path.join(userDir, sanitizedFileName);

  await fs.writeFile(absolutePath, buffer);

  const relativePath = path.join('users', userId, sanitizedFileName).replace(/\\/g, '/');
  return { relativePath, absolutePath };
}

export async function readUserFile(userId: string, relativePath: string): Promise<Buffer | null> {
  const normalizedPath = path.normalize(relativePath).replace(/\\/g, '/');
  const expectedPrefix = `users/${userId}/`;
  if (!normalizedPath.startsWith(expectedPrefix)) {
    throw new Error('Akses file tidak diizinkan');
  }

  const root = getStorageRoot();
  const absolutePath = path.join(root, normalizedPath);
  try {
    return await fs.readFile(absolutePath);
  } catch {
    return null;
  }
}

export async function deleteUserFile(userId: string, relativePath: string): Promise<boolean> {
  const normalizedPath = path.normalize(relativePath).replace(/\\/g, '/');
  const expectedPrefix = `users/${userId}/`;
  if (!normalizedPath.startsWith(expectedPrefix)) {
    return false;
  }

  const root = getStorageRoot();
  const absolutePath = path.join(root, normalizedPath);
  try {
    await fs.unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
}
