import sharp from 'sharp';

/**
 * Validasi Magic Bytes untuk memastikan file asli adalah PNG, JPEG, atau WebP.
 * Menghindari eksploitasi MIME spoofing dan XSS via SVG.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; format?: 'png' | 'jpeg' | 'webp' } {
  if (buffer.length < 12) return { valid: false };

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: 'png' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: 'jpeg' };
  }

  // WebP: RIFF .... WEBP
  const riff = buffer.subarray(0, 4).toString('ascii');
  const webp = buffer.subarray(8, 12).toString('ascii');
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, format: 'webp' };
  }

  return { valid: false };
}

export interface SanitizedImageResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'png';
  sizeBytes: number;
}

/**
 * Memproses gambar logo:
 * - Hapus EXIF metadata (privasi lokasi pengunggah)
 * - Resize ke dimensi aman (maksimal 256x256)
 * - Konversi ke PNG dengan transparansi yang bersih
 * - Mencegah decompression bomb dengan mengecek ukuran pixel
 */
export async function sanitizeAndResizeLogo(inputBuffer: Buffer): Promise<SanitizedImageResult> {
  const check = validateImageMagicBytes(inputBuffer);
  if (!check.valid) {
    throw new Error('Format gambar tidak diizinkan. Hanya menerima PNG, JPEG, dan WebP.');
  }

  const image = sharp(inputBuffer, { failOnError: true, limitInputPixels: 4000000 }); // limit 4MP
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Dimensi gambar tidak valid.');
  }

  if (metadata.width > 2048 || metadata.height > 2048) {
    throw new Error('Dimensi gambar maksimal 2048x2048 piksel.');
  }

  // Resize proporsional dengan fit inside 256x256
  const cleanBuffer = await image
    .rotate() // auto orient berdasarkan EXIF sebelum EXIF dibuang
    .withMetadata({ exif: {} }) // bersihkan EXIF
    .resize(256, 256, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png({ quality: 90, compressionLevel: 8 })
    .toBuffer();

  const finalMeta = await sharp(cleanBuffer).metadata();

  return {
    buffer: cleanBuffer,
    width: finalMeta.width || 256,
    height: finalMeta.height || 256,
    format: 'png',
    sizeBytes: cleanBuffer.length,
  };
}
