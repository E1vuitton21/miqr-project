import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(60, 'Nama maksimal 60 karakter'),
    email: z.string().email('Format email tidak valid').toLowerCase(),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid').toLowerCase(),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const hexColorRegex = /^#([A-Fa-f0-9]{6})$/;

export const qrConfigSchema = z.object({
  name: z.string().min(1, 'Nama QR wajib diisi').max(100, 'Nama QR maksimal 100 karakter'),
  contentType: z.enum(['URL', 'TEXT', 'EMAIL', 'PHONE', 'WIFI', 'VCARD']),
  payload: z.string().min(1, 'Konten QR tidak boleh kosong').max(4096, 'Konten maksimal 4096 karakter'),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  foreground: z.string().regex(hexColorRegex, 'Format warna foreground harus Hex 6 digit (contoh: #000000)').default('#000000'),
  background: z.string().regex(hexColorRegex, 'Format warna background harus Hex 6 digit (contoh: #FFFFFF)').default('#FFFFFF'),
  width: z.coerce.number().int().min(256).max(4096).default(1024),
  margin: z.coerce.number().int().min(0).max(20).default(4),
  dotsStyle: z.enum(['SQUARE', 'ROUNDED', 'DOTS']).default('SQUARE'),
  fileFormat: z.enum(['PNG', 'SVG']).default('PNG'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type QrConfigInput = z.infer<typeof qrConfigSchema>;
