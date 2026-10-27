import QRCode from 'qrcode';
import sharp from 'sharp';

export interface GenerateQrServerOptions {
  payload: string;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  foreground?: string;
  background?: string;
  width?: number;
  margin?: number;
  fileFormat?: 'PNG' | 'SVG';
  logoBuffer?: Buffer;
}

export async function generateServerQrBuffer(options: GenerateQrServerOptions): Promise<{
  buffer: Buffer;
  contentType: string;
  sizeBytes: number;
}> {
  const {
    payload,
    errorCorrection = 'M',
    foreground = '#000000',
    background = '#FFFFFF',
    width = 1024,
    margin = 4,
    fileFormat = 'PNG',
    logoBuffer,
  } = options;

  if (fileFormat === 'SVG' && !logoBuffer) {
    const svgString = await QRCode.toString(payload, {
      type: 'svg',
      errorCorrectionLevel: errorCorrection,
      color: {
        dark: foreground,
        light: background,
      },
      margin,
      width,
    });
    const buf = Buffer.from(svgString, 'utf-8');
    return {
      buffer: buf,
      contentType: 'image/svg+xml',
      sizeBytes: buf.length,
    };
  }

  // Generate Base QR Code as PNG Buffer
  const qrPngBuffer = await QRCode.toBuffer(payload, {
    type: 'png',
    errorCorrectionLevel: logoBuffer ? (errorCorrection === 'L' ? 'Q' : errorCorrection) : errorCorrection,
    color: {
      dark: foreground,
      light: background,
    },
    margin,
    width,
  });

  // Jika tidak ada logo, langsung kembalikan PNG buffer
  if (!logoBuffer) {
    return {
      buffer: qrPngBuffer,
      contentType: 'image/png',
      sizeBytes: qrPngBuffer.length,
    };
  }

  // Jika ada logo, lakukan komposit di tengah dengan padding pelindung
  const qrMetadata = await sharp(qrPngBuffer).metadata();
  const qrSize = qrMetadata.width || width;

  // Ukuran logo maksimal 22% dari total lebar QR Code agar tidak merusak modul
  const targetLogoSize = Math.floor(qrSize * 0.22);
  const padSize = Math.floor(targetLogoSize * 1.15); // Sedikit padding putih di belakang logo

  // Buat background pad putih/bulat untuk logo
  const padBuffer = await sharp({
    create: {
      width: padSize,
      height: padSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  // Resize logo kustom ke target ukuran
  const resizedLogo = await sharp(logoBuffer)
    .resize(targetLogoSize, targetLogoSize, { fit: 'inside' })
    .png()
    .toBuffer();

  // Komposit logo di atas pad
  const logoWithPad = await sharp(padBuffer)
    .composite([
      {
        input: resizedLogo,
        gravity: 'center',
      },
    ])
    .png()
    .toBuffer();

  // Komposit logoWithPad di tengah QR Code
  const finalQrBuffer = await sharp(qrPngBuffer)
    .composite([
      {
        input: logoWithPad,
        gravity: 'center',
      },
    ])
    .png({ quality: 95 })
    .toBuffer();

  return {
    buffer: finalQrBuffer,
    contentType: 'image/png',
    sizeBytes: finalQrBuffer.length,
  };
}
